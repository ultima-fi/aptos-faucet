import { AirdropClient } from "@ultima-fi/airdrop";
import { createContext, useContext, useEffect, useState } from "react";
import { compile } from "./compiler";
import { AIRDROP_MODULE, RPC_URL } from "./env";

interface IAptoseContext {
  address: string;
  sdk: undefined | AirdropClient;
}

const AptosContext = createContext<IAptoseContext>({
  address: "",
  sdk: undefined,
});

function Field(props: { label: string; children: JSX.Element }) {
  return (
    <div className="field">
      <label htmlFor="" className="label">
        {props.label}
      </label>
      <div className="control">{props.children}</div>
    </div>
  );
}

function CreateCoin() {
  const [coinName, setCoinName] = useState("");
  const ctx = useContext(AptosContext);
  const createCoin = async () => {
    try {
      const hex = await compile(coinName, ctx.address);

      {
        const tx = await window.aptos.signAndSubmitTransaction({
          type: "module_bundle_payload",
          modules: [{ bytecode: `0x${hex}` }],
        });
        console.log(tx["hash"]);
        await ctx.sdk?.client.waitForTransaction(tx["hash"]);
      }
      const typestring = `0x${ctx.address}::${coinName}::${coinName}`;

      {
        const ix = ctx.sdk?.createAirdropIX(coinName, coinName, 6, typestring);
        const tx = await window.aptos.signAndSubmitTransaction(ix);
        console.log(tx["hash"]);
        await ctx.sdk?.client.waitForTransaction(tx["hash"]);
      }
    } catch (e: any) {
      console.log(e);
    }
  };

  return (
    <div>
      <h2>Create Coin</h2>
      <Field label="Name">
        <input
          className="input"
          type="text"
          value={coinName}
          onChange={(e) => setCoinName(e.target.value)}
        ></input>
      </Field>

      <button onClick={createCoin}>Create Coin</button>
    </div>
  );
}

function App() {
  const [user, setUser] = useState<string>("");
  const [client, setClient] = useState<AirdropClient>();

  useEffect(() => {
    setClient(new AirdropClient(RPC_URL, AIRDROP_MODULE));
    window.aptos.connect();
    window.aptos.account().then((a: any) => setUser(a.address.slice(2)));
  }, []);

  return (
    <AptosContext.Provider value={{ address: user, sdk: client }}>
      <section className="section content">
        <div className="container">
          <div>
            <h1>Aptos Coin Creator</h1>
            <div>{user}</div>

            <div>
              <CreateCoin />
            </div>
          </div>
        </div>
      </section>
    </AptosContext.Provider>
  );
}

export default App;
