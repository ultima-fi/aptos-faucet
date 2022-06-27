module Faucet::Faucet {
    use AptosFramework::Coin::{Self, MintCapability, BurnCapability};
    use AptosFramework::Table::{Table, Self};
    use AptosFramework::ASCII;
    use AptosFramework::TypeInfo::{TypeInfo, type_of};
    use Std::Signer;
    use Std::Event::{Self, EventHandle};

    const ENOT_ADMIN: u64 = 1;
    // The faucet is not published
    const ENOT_PUBLISHED: u64 = 2;
    // The Faucet root store is not initialized
    const ENOT_INITIALIZED: u64 = 3;
    const EPAUSED: u64 = 4;
    const ENOT_AUTHORIZED: u64 = 5;

    struct FaucetMeta<phantom CoinType> has key {
        mint_cap: MintCapability<CoinType>,
        burn_cap: BurnCapability<CoinType>,
        is_paused: bool
    }

    struct FaucetStore has key {
        addresses: Table<TypeInfo, address>
    }

    struct FaucetEvents has key {
        register_events: EventHandle<RegisterEvent>
    }

    struct RegisterEvent has drop, store {
        type_info: TypeInfo
    }

    public(script) fun init(admin: signer) {
        assert!(Signer::address_of(&admin) == @Faucet, ENOT_ADMIN);
        move_to(&admin, FaucetStore {
            addresses: Table::new<TypeInfo, address>()
        });
    }

    public(script) fun create_faucet_coin<C>(
        owner: signer, 
        name: vector<u8>,
        symbol: vector<u8>,
        decimals: u64,
    ) acquires FaucetStore, FaucetEvents {
        let addr = Signer::address_of(&owner); 

        assert!(exists<FaucetStore>(@Faucet), ENOT_INITIALIZED);
        
        if (!exists<FaucetEvents>(addr)) {
            move_to(&owner, FaucetEvents {
                register_events: Event::new_event_handle<RegisterEvent>(&owner),
            });
        };

        let events = borrow_global_mut<FaucetEvents>(addr);
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

        move_to(&owner, FaucetMeta<C>{
            mint_cap,
            burn_cap,
            is_paused: false
        });
        
        // store the location of the capabilities
        let store = borrow_global_mut<FaucetStore>(@Faucet);
        let ti = type_of<C>();
        let addresses = &mut store.addresses;
        Table::add<TypeInfo, address>(addresses, ti, addr);
    }

    public(script) fun mint<C>(owner: signer, amount: u64) acquires FaucetStore, FaucetMeta {
        let addr = get_faucet_addr<C>();
        let receiver = Signer::address_of(&owner); 
        let faucet = borrow_global<FaucetMeta<C>>(addr);
        assert!(!faucet.is_paused, EPAUSED);
        let coins = Coin::mint<C>(amount, &faucet.mint_cap);
        Coin::deposit<C>(receiver, coins);
    }

    public(script) fun burn<C>(account: &signer, amount: u64) acquires FaucetStore, FaucetMeta {
        let addr = get_faucet_addr<C>();
        let faucet = borrow_global<FaucetMeta<C>>(addr);
        assert!(!faucet.is_paused, EPAUSED);
        let to_burn = Coin::withdraw<C>(account, amount);
        Coin::burn(to_burn, &faucet.burn_cap);
    }

    public(script) fun pause<C>(account: &signer) acquires FaucetStore, FaucetMeta {
        let addr = get_faucet_addr<C>();
        assert!(addr == Signer::address_of(account), ENOT_AUTHORIZED);
        let faucet = borrow_global_mut<FaucetMeta<C>>(addr);
        faucet.is_paused = true;
    }

    public(script) fun unpause<C>(account: &signer) acquires FaucetStore, FaucetMeta {
        let addr = get_faucet_addr<C>();
        assert!(addr == Signer::address_of(account), ENOT_AUTHORIZED);
        let faucet = borrow_global_mut<FaucetMeta<C>>(addr);
        faucet.is_paused = false;
    }

    fun get_faucet_addr<C>(): address acquires FaucetStore {
        assert!(exists<FaucetStore>(@Faucet), ENOT_INITIALIZED);
        let store = borrow_global<FaucetStore>(@Faucet);
        let ti = type_of<C>();
        assert!(Table::contains<TypeInfo, address>(&store.addresses, ti), ENOT_PUBLISHED);
        let addr = *Table::borrow<TypeInfo, address>(&store.addresses, ti);
        addr
    }
}