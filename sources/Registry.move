module Faucet::Registry {
    use AptosFramework::IterableTable::{IterableTable, Self};
    use AptosFramework::TypeInfo::{TypeInfo, type_of, account_address};
    use AptosFramework::ASCII;
    use Std::Signer;
    use Std::Vector;
    use Faucet::Faucet::is_faucet_published;

    const ENOT_AUTHORIZED: u64 = 1;
    const ENOT_PUBLISHED: u64 = 2;
    const ENOT_INITIALIZED: u64 = 3;
    const ENOT_ADMIN: u64 = 4;
    const EALREADY_INITIALIZED: u64 = 5;

    struct Registry has key {
        faucet_table: IterableTable<TypeInfo, FaucetMetadata>,
        faucet_keys: vector<TypeInfo>
    }

    struct FaucetMetadata has store, drop {
        name: ASCII::String,
        symbol: ASCII::String,
        description: ASCII::String,
        logo_url: ASCII::String,
        decimals: u64
    }

    public(script) fun init(admin: &signer) {
        assert!(Signer::address_of(admin) == @Faucet, ENOT_ADMIN);
        assert!(!exists<Registry>(@Faucet), EALREADY_INITIALIZED);
        move_to(admin, Registry {
            faucet_table: IterableTable::new<TypeInfo, FaucetMetadata>(),
            faucet_keys: Vector::empty<TypeInfo>()
        });
    }

    public(script) fun put<C>(owner: &signer, name: vector<u8>, symbol: vector<u8>, description: vector<u8>, logo_url: vector<u8>, decimals: u64) acquires Registry {
        let addr = Signer::address_of(owner);
        let ti = type_of<C>();

        assert!(exists<Registry>(@Faucet), ENOT_INITIALIZED);
        assert!(addr == account_address(&ti), ENOT_AUTHORIZED);
        assert!(is_faucet_published<C>(addr), ENOT_PUBLISHED);

        let registry = borrow_global_mut<Registry>(@Faucet);
        let table = &mut registry.faucet_table;

        if (IterableTable::contains<TypeInfo, FaucetMetadata>(table, ti)) {
            let _ = IterableTable::remove<TypeInfo, FaucetMetadata>(table, ti);
        } else {
            let keys = &mut registry.faucet_keys;
            Vector::push_back<TypeInfo>(keys, ti);
        };

        let new_metadata = FaucetMetadata {
            name: ASCII::string(name),
            symbol: ASCII::string(symbol),
            logo_url: ASCII::string(logo_url),
            description: ASCII::string(description),
            decimals
        };
 
        IterableTable::add<TypeInfo, FaucetMetadata>(table, ti, new_metadata);
    }
}