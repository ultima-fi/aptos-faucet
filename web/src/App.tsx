import { FaucetClient } from "@ultima-fi/faucet";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import { compile } from "./compiler";
import { FAUCET_MODULE, RPC_URL } from "./env";
import "react-toastify/dist/ReactToastify.css";
import { explorer } from "./util";
import { BrowserRouter, Route, Routes } from "react-router-dom";

interface IAptoseContext {
  address: string;
  sdk: undefined | FaucetClient;
}

const AptosContext = createContext<IAptoseContext>({
  address: "",
  sdk: undefined,
});

function Field(props: {
  label: string;
  children: JSX.Element;
  help?: JSX.Element;
}) {
  return (
    <div className="field">
      <label htmlFor="" className="label">
        {props.label}
      </label>
      <div className="control">{props.children}</div>
      {props.help && props.help}
    </div>
  );
}

function CreateCoin(props: { onsuccess: () => void }) {
  const toastId = useRef(null) as any;
  const [coinName, setCoinName] = useState("");
  const [busy, setBusy] = useState(false);
  const ctx = useContext(AptosContext);
  const validRegex = new RegExp("^[A-Z][A-Za-z]*$");
  const coinNameValid = coinName.length > 0 && validRegex.test(coinName);

  const disabled = busy || !coinNameValid || !ctx.address;
  const help =
    coinName !== "" && !coinNameValid ? (
      <p className="help is-danger">
        Coin name is invalid. Must start with capital letter and be alphabetic.
      </p>
    ) : undefined;

  function link(hash: string) {
    const url = explorer(hash);
    return (
      <a href={url} target="_blank">
        View transaction.
      </a>
    );
  }

  async function createCoin() {
    setBusy(true);

    try {
      toastId.current = toast("Preparing module");
      const hex = await compile(coinName, ctx.address);
      toast.update(toastId.current, { render: "Publishing module" });
      {
        const tx = await window.aptos.signAndSubmitTransaction({
          type: "module_bundle_payload",
          modules: [{ bytecode: `0x${hex}` }],
        });
        await ctx.sdk?.client.waitForTransaction(tx["hash"]);
        toast(<span>Module published. {link(tx["hash"])}</span>);
      }
      const typestring = `0x${ctx.address}::${coinName}::${coinName}`;
      toast.update(toastId.current, { render: "Creating coin faucet" });
      {
        const ix = ctx.sdk?.createFaucetIX(coinName, coinName, 6, typestring);
        const tx = await window.aptos.signAndSubmitTransaction(ix);
        const hash = tx["hash"];
        await ctx.sdk?.client.waitForTransaction(tx["hash"]);
        toast(<span>Coin faucet created. {link(hash)}</span>);
      }

      setBusy(false);
      setCoinName("");
      props.onsuccess();
    } catch (e: any) {
      toast.error(e);
    }
  }

  return (
    <div>
      <h2>Create Coin</h2>
      <Field label="Name" help={help}>
        <input
          className="input"
          type="text"
          placeholder="FooCoin"
          value={coinName}
          onChange={(e) => setCoinName(e.target.value)}
        ></input>
      </Field>

      <button className="button" onClick={createCoin} disabled={disabled}>
        Create Coin
      </button>
    </div>
  );
}

function ListFaucets(props: { faucets: string[] }) {
  return (
    <div>
      <h3>Faucets you created</h3>
      <ul>
        {props.faucets.map((x, i) => (
          <li key={i}>{x}</li>
        ))}
      </ul>
    </div>
  );
}

function UseFaucet() {}

function App() {
  const [user, setUser] = useState<string>("");
  const [errorBanner, setErrorBannoer] = useState(false);
  const [sdk, setSDK] = useState<FaucetClient>();
  const [faucets, setFaucets] = useState<string[]>([]);

  function refreshFaucets() {
    if (!sdk) return;
    if (user === "") return;
    sdk.fetchFaucets(user).then(setFaucets);
  }

  useEffect(refreshFaucets, [sdk, user]);

  useEffect(() => {
    if (!window.aptos) {
      setErrorBannoer(true);
      return;
    }
    setSDK(new FaucetClient(RPC_URL, FAUCET_MODULE));
    window.aptos.connect();
    window.aptos.account().then((a: any) => setUser(a.address.slice(2)));
  }, [window.aptos]);

  return (
    <AptosContext.Provider value={{ address: user, sdk }}>
      <section className="section content">
        <div className="container">
          <div>
            <h1>Aptos Coin Creator</h1>
            {errorBanner && (
              <div className="is-danger notification">
                You must{" "}
                <a
                  href="https://aptos.dev/tutorials/building-wallet-extension/"
                  target="_blank"
                >
                  install the Aptos wallet extension{" "}
                </a>
                to use this
              </div>
            )}
            <p>You: 0x{user}</p>

            <BrowserRouter>
              <Routes>
                <Route
                  path="/"
                  element={<CreateCoin onsuccess={refreshFaucets} />}
                ></Route>
              </Routes>
            </BrowserRouter>

            <div>
              <ListFaucets faucets={faucets} />
            </div>
          </div>
        </div>
      </section>
      <ToastContainer />
    </AptosContext.Provider>
  );
}

export default App;
