import { FaucetClient } from "@ultima-fi/faucet";
import { useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import { FAUCET_MODULE, RPC_URL } from "./env";
import "react-toastify/dist/ReactToastify.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AptosContext } from "./context";
import { CreateFaucet } from "./CreateFaucet";
import { Mint } from "./Mint";
import { Nav } from "./Nav";

function App() {
  const [user, setUser] = useState<string>("");
  const [errorBanner, setErrorBannoer] = useState(false);
  const [sdk, setSDK] = useState<FaucetClient>();

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
      <section className="section">
        <div className="container">
          <h1 className="title">Aptos Coin Creator</h1>
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
          <br></br>
          <BrowserRouter>
            <Nav />
            <Routes>
              <Route path="/" element={<CreateFaucet />}></Route>
              <Route path="/mint" element={<Mint />}></Route>
            </Routes>
          </BrowserRouter>
        </div>
      </section>
      <ToastContainer />
    </AptosContext.Provider>
  );
}

export default App;
