import { useContext, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { compile } from "./compiler";
import { AptosContext } from "./context";
import { Field } from "./Field";
import { ListFaucets } from "./ListFaucets";
import { link } from "./util";

export function CreateFaucet() {
  const toastId = useRef(null) as any;
  const [coinName, setCoinName] = useState("");
  const [decimals, setDecimals] = useState(0);
  const [faucets, setFaucets] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const ctx = useContext(AptosContext);
  useEffect(refreshFaucets, [ctx.sdk, ctx.address]);
  const validRegex = new RegExp("^[A-Z][A-Za-z]*$");
  const coinNameValid = coinName.length > 0 && validRegex.test(coinName);
  const decimalsValid = decimals >= 0;
  const buttonDisabled = busy || !coinNameValid || !decimalsValid;
  const allDisabled = busy || !ctx.address || !ctx.sdk;
  const help =
    coinName !== "" && !coinNameValid ? (
      <p className="help is-danger">
        Coin name is invalid. Must start with capital letter and be alphabetic.
      </p>
    ) : undefined;

  function refreshFaucets() {
    if (!ctx.sdk) return;
    if (ctx.address === "") return;
    ctx.sdk.fetchFaucets(ctx.address).then(setFaucets);
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
        const ix = ctx.sdk?.createFaucetIX(
          coinName,
          coinName,
          decimals,
          typestring
        );
        const tx = await window.aptos.signAndSubmitTransaction(ix);
        const hash = tx["hash"];
        await ctx.sdk?.client.waitForTransaction(tx["hash"]);
        toast(<span>Coin faucet created. {link(hash)}</span>);
      }
    } catch (e: any) {
      toast.error(e);
    } finally {
      setBusy(false);
      setCoinName("");
      refreshFaucets();
    }
  }

  return (
    <div>
      <h3 className="title is-3">Create Faucet</h3>
      <p className="has-text-weight-light mb-3">
        A faucet is a unique coin that any account can mint for themselves. This
        is useful for testing & and letting users serve themselves your coins.
        <br />
        The process of creating a faucet involves deploying a new module to
        Aptos. The <strong>Coin Emporium</strong> compiles the module for you.
      </p>

      <Field label="Name" help={help}>
        <input
          className="input"
          type="text"
          disabled={allDisabled}
          placeholder="FooCoin"
          value={coinName}
          onChange={(e) => setCoinName(e.target.value)}
        ></input>
      </Field>

      <Field label="Decimals">
        <input
          disabled={allDisabled}
          type="number"
          className="input"
          placeholder="0"
          value={decimals || ""}
          onChange={(e) => setDecimals(+e.target.value)}
        ></input>
      </Field>

      <button
        className="button is-info"
        onClick={createCoin}
        disabled={buttonDisabled}
      >
        Create Faucet
      </button>

      <hr></hr>
      <div>
        <ListFaucets faucets={faucets} />
      </div>
    </div>
  );
}
