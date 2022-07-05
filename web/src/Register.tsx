import { useContext, useRef, useState } from "react";
import { toast } from "react-toastify";
import { AptosContext } from "./context";
import { Field } from "./Field";
import { link, validType } from "./util";

export function Register() {
  const toastId = useRef(null) as any;
  const [coinType, setCoinType] = useState("");
  const [busy, setBusy] = useState(false);
  const ctx = useContext(AptosContext);
  const coinTypeValid = validType(coinType);
  const buttonDisabled = busy || !coinTypeValid;
  const allDisabled = busy || !ctx.sdk || !ctx.address;
  const help =
    coinType !== "" && !coinTypeValid ? (
      <p className="help is-danger">
        Coin type is invalid. Must be in the format 0x123::FooCoin::FooCoin.
      </p>
    ) : undefined;

  async function doRegister() {
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

      if (coinRegistration) {
        toast.update(toastId.current, {
          render: "Coin already registered",
        });
        return;
      }
      toast.update(toastId.current, {
        render: "Registering coin",
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
      if (await sdk.client.transactionDidSucceed(hash)) {
        toast.success(<span>Coins registered. {link(hash)}</span>);
      } else {
        toast.error(<span>Coin registration failed. {link(hash)}</span>);
      }

      // mint the coin
    } catch (e: any) {
      console.error(e);
      toast.error("Transaction failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <h3 className="title is-3">Register coin</h3>

      <p className="has-text-weight-light mb-3">
        Before an account can hold coins, it needs to <strong>register</strong>{" "}
        its address with the coin.
        <br />
        This is a one-time operation that must be performed by the account
        itself.
      </p>

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

      <button
        className="button is-success"
        onClick={doRegister}
        disabled={buttonDisabled}
      >
        Register
      </button>
    </div>
  );
}
