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
import { Footer } from "./Footer";
import { Transfer } from "./Transfer";
import { ErrorBanner } from "./ErrorBanner";
import { Balances } from "./Balances";

function App() {
  const [user, setUser] = useState<string>("");
  const [errorBanner, setErrorBanner] = useState(false);
  const [sdk, setSDK] = useState<FaucetClient>();

  useEffect(() => {
    // window.aptos is flaky
    setTimeout(() => {
      if (!window.aptos) {
        setErrorBanner(true);
        return;
      }
      setSDK(new FaucetClient(RPC_URL, FAUCET_MODULE));
      window.aptos.connect();
      window.aptos.account().then((a: any) => setUser(a.address.slice(2)));
    }, 1000);
  }, [window.aptos]);

  return (
    <AptosContext.Provider value={{ address: user, sdk }}>
      <section className="section">
        <div className="container">
          <h1 className="title is-1">Aptos Coin Emporium</h1>
          <p className="subtitle">
            From{" "}
            <a href="https://github.com/ultima-fi/aptos-faucet" target="_blank">
              Ultima Labs
            </a>
          </p>
          {errorBanner && <ErrorBanner />}
          {user && <p>You: 0x{user}</p>}
          <br></br>
          <BrowserRouter>
            <Nav />
            <Routes>
              <Route path="/" element={<CreateFaucet />}></Route>
              <Route path="/mint" element={<Mint />}></Route>
              <Route path="/balances" element={<Balances />}></Route>
              <Route path="/transfer" element={<Transfer />}></Route>
            </Routes>
          </BrowserRouter>
        </div>
      </section>
      <Footer />
      <ToastContainer />
    </AptosContext.Provider>
  );
}

export default App;
