import { useContext, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { compile } from "./compiler";
import { AptosContext } from "./context";
import { Field } from "./Field";
import { ListFaucets } from "./ListFaucets";
import { explorer } from "./util";

export function CreateFaucet() {
  const toastId = useRef(null) as any;
  const [coinName, setCoinName] = useState("");
  const [faucets, setFaucets] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const ctx = useContext(AptosContext);
  useEffect(refreshFaucets, [ctx.sdk, ctx.address]);
  const validRegex = new RegExp("^[A-Z][A-Za-z]*$");
  const coinNameValid = coinName.length > 0 && validRegex.test(coinName);

  const disabled = busy || !coinNameValid || !ctx.address;
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
      refreshFaucets();
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

      <div>
        <ListFaucets faucets={faucets} />
      </div>
    </div>
  );
}
