import { useContext, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { BalanceTable } from "./BalanceTable";
import { AptosContext } from "./context";
import { Field } from "./Field";
import { link, validAddress, validType } from "./util";

export function Transfer() {
  const toastId = useRef(null) as any;
  const [coinType, setCoinType] = useState("");
  const [target, setTarget] = useState("");
  const [amount, setAmount] = useState(0);
  const [balances, setBalances] = useState<{ coin: string; balance: number }[]>(
    []
  );
  const [busy, setBusy] = useState(false);
  const ctx = useContext(AptosContext);

  useEffect(() => {
    getBalances();
  }, [ctx.sdk, ctx.address]);
  const maxAmount = balances.find((b) => b.coin === coinType)?.balance || 0;
  const overMax = amount > maxAmount;
  const targetValid = validAddress(target);
  const buttonDisabled = !amount || !targetValid || busy || overMax;
  const allDisabled = busy || !ctx.sdk || !ctx.address;

  const amountHelp =
    amount > 0 && overMax ? (
      <p className="help is-danger">Insufficient funds for transfer.</p>
    ) : undefined;

  const targetHelp =
    target !== "" && !targetValid ? (
      <p className="help is-danger">
        Receiver address is invalid. Must be in the format 0x123abc.
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
        target,
        `0x1::Coin::CoinStore<${coinType}>`
      );

      if (!coinRegistration) {
        // coin is not registered
        // so register it
        toast.update(toastId.current, {
          render: "Coin is not registered for receiver.  Aborting.",
        });
        return;
      }
      toast.update(toastId.current, {
        render: "Transferring coins.",
      });
      const ix = {
        type: "script_function_payload",
        function: "0x1::Coin::transfer",
        type_arguments: [coinType],
        arguments: [target, amount.toString()],
      };
      const tx = await window.aptos.signAndSubmitTransaction(ix);
      const hash = tx["hash"];
      await sdk.client.waitForTransaction(hash);
      toast.success(<span>Coins transferred. {link(hash)}</span>);
    } catch (e: any) {
      console.error(e);
      toast.error("Transaction failed");
    } finally {
      setAmount(0);
      setBusy(false);
    }
  }

  async function getBalances() {
    const sdk = ctx.sdk;
    if (!sdk) return;
    if (!ctx.address) return;

    setBusy(true);

    try {
      const bs = await sdk.client.allCoinBalances(ctx.address);
      setBalances(bs);
      if (bs.length > 0) {
        setCoinType(bs[0].coin);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <h3 className="title is-3">Transfer to recipient</h3>

      <p className="has-text-weight-light mb-3">
        You can transfer coins to any recipient that has already registered
        themselves for that coin.
        <br />
        In Aptos, you cannot receive a coin type until you have opted-in for it
        by signing a registration transaction.
      </p>

      <Field label="Coin type">
        <div className="select">
          <select
            onChange={(e) => setCoinType(e.target.value)}
            disabled={allDisabled}
          >
            {balances.map((b, i) => (
              <option key={i} value={b.coin}>
                {b.coin} - {b.balance}
              </option>
            ))}
          </select>
        </div>
      </Field>

      {/* <Field label="Coin type" help={coinTypeHelp}>
        <input
          className="input"
          disabled={allDisabled}
          value={coinType}
          onChange={(e) => setCoinType(e.target.value)}
          placeholder="0x123::FooCoin::FooCoin"
          type="text"
        ></input>
      </Field> */}

      <Field label="Amount" help={amountHelp}>
        <input
          disabled={allDisabled}
          type="number"
          className="input"
          value={amount || ""}
          onChange={(e) => setAmount(+e.target.value)}
        ></input>
      </Field>

      <Field label="Target address" help={targetHelp}>
        <input
          className="input"
          disabled={allDisabled}
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          placeholder="0x123abc"
          type="text"
        ></input>
      </Field>

      <button
        className="button is-success"
        onClick={doMint}
        disabled={buttonDisabled}
      >
        Transfer
      </button>
    </div>
  );
}
