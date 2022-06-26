module Airdrop::Airdrop {
    use AptosFramework::Coin::{Self, MintCapability, BurnCapability};
    use AptosFramework::Table::{Table, Self};
    use AptosFramework::ASCII;
    use AptosFramework::TypeInfo::{TypeInfo, type_of};
    use Std::Signer;
    use Std::Event::{Self, EventHandle};

    const ENOT_ADMIN: u64 = 1;
    const ENOT_PUBLISHED: u64 = 2;

    struct Capabilities<phantom CoinType> has key {
        mint_cap: MintCapability<CoinType>,
        burn_cap: BurnCapability<CoinType>,
    }

    struct AirdropStore has key {
        addresses: Table<TypeInfo, address>
    }

    struct AirdropEvents has key {
        register_events: EventHandle<RegisterEvent>
    }

    struct RegisterEvent has drop, store {
        type_info: TypeInfo
    }

    public(script) fun init(admin: signer) {
        assert!(Signer::address_of(&admin) == @Airdrop, ENOT_ADMIN);
        move_to(&admin, AirdropStore {
            addresses: Table::new<TypeInfo, address>()
        });
    }

    public(script) fun create_airdrop<C>(
        owner: signer, 
        name: vector<u8>,
        symbol: vector<u8>,
        decimals: u64,
    ) acquires AirdropStore, AirdropEvents {
        let addr = Signer::address_of(&owner); 

        if (!exists<AirdropEvents>(addr)) {
            move_to(&owner, AirdropEvents {
                register_events: Event::new_event_handle<RegisterEvent>(&owner),
            });
        };

        let events = borrow_global_mut<AirdropEvents>(addr);
        Event::emit_event<RegisterEvent>(
            &mut events.register_events,
            RegisterEvent {
                type_info: type_of<C>(),
            },
        );

        let (mint_cap, burn_cap) = Coin::initialize<C>(
            &owner,
            ASCII::string(name),
            ASCII::string(symbol),
            decimals,
            true,
        );

        move_to(&owner, Capabilities<C>{
            mint_cap,
            burn_cap,
        });
        
        // store the location of the capabilities
        let store = borrow_global_mut<AirdropStore>(@Airdrop);
        let ti = type_of<C>();
        let addresses = &mut store.addresses;
        Table::add<TypeInfo, address>(addresses, ti, addr);
    }

    public(script) fun airdrop<C>(owner: signer, amount: u64) acquires AirdropStore, Capabilities {
        let receiver = Signer::address_of(&owner);
        let store = borrow_global<AirdropStore>(@Airdrop);
        let ti = type_of<C>();

        assert!(Table::contains<TypeInfo, address>(&store.addresses, ti), ENOT_PUBLISHED);

        let addr = Table::borrow<TypeInfo, address>(&store.addresses, ti);
        let caps = borrow_global<Capabilities<C>>(*addr);
        let coins = Coin::mint<C>(amount, &caps.mint_cap);

        Coin::deposit<C>(receiver, coins);
    }
}