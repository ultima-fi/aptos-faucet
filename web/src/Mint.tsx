import { useContext, useRef, useState } from "react";
import { toast } from "react-toastify";
import { AptosContext } from "./context";
import { Field } from "./Field";
import { link, validType } from "./util";

export function Mint() {
  const toastId = useRef(null) as any;
  const [coinType, setCoinType] = useState("");
  const [amount, setAmount] = useState(0);
  const [busy, setBusy] = useState(false);
  const ctx = useContext(AptosContext);
  const coinTypeValid = validType(coinType);
  const buttonDisabled = !amount || busy;
  const allDisabled = busy || !ctx.sdk || !ctx.address;
  const help =
    coinType !== "" && !coinTypeValid ? (
      <p className="help is-danger">
        Coin type is invalid. Must be in the format 0x123::FooCoin::FooCoin.
      </p>
    ) : undefined;
  async function doMint() {
    const sdk = ctx.sdk;
    if (!sdk) return;
    if (!ctx.address) return;
    setBusy(true);
    // check is coin registered

    toastId.current = toast("Checking if coin is registered");
    try {
      const coinRegistration = await sdk.client.accountResource(
        ctx.address,
        `0x1::Coin::CoinStore<${coinType}>`
      );

      if (!coinRegistration) {
        // coin is not registered
        // so register it
        toast.update(toastId.current, {
          render: "Registering coin for first time",
        });
        const ix = {
          type: "script_function_payload",
          function: "0x1::Coin::register",
          type_arguments: [coinType],
          arguments: [],
        };
        const tx = await window.aptos.signAndSubmitTransaction(ix);
        const hash = tx["hash"];
        await sdk.client.waitForTransaction(hash);
        toast.success(<span>Coins registered. {link(hash)}</span>);
      }

      toast.update(toastId.current, {
        render: "Minting coin",
      });

      // mint the coin
      const ix = sdk.mintIX(coinType, amount);
      const tx = await window.aptos.signAndSubmitTransaction(ix);
      const hash = tx["hash"];
      console.log(hash);
      await sdk.client.waitForTransaction(hash);

      toast.update(toastId.current, {
        render: <span>Coins minted. {link(hash)}</span>,
      });
    } catch (e: any) {
      console.error(e);
      toast.error("Transaction failed");
    } finally {
      setAmount(0);
      setBusy(false);
    }
  }

  return (
    <div>
      <h3 className="title is-3">Mint from faucet</h3>
      <Field label="Coin address" help={help}>
        <input
          className="input"
          disabled={allDisabled}
          value={coinType}
          onChange={(e) => setCoinType(e.target.value)}
          placeholder="0x123::FooCoin::FooCoin"
          type="text"
        ></input>
      </Field>

      <Field label="Amount">
        <input
          disabled={allDisabled}
          type="number"
          className="input"
          value={amount || ""}
          onChange={(e) => setAmount(+e.target.value)}
        ></input>
      </Field>

      <button
        className="button is-success"
        onClick={doMint}
        disabled={buttonDisabled}
      >
        Mint
      </button>
    </div>
  );
}
