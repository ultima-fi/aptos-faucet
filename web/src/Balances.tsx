import { useContext, useEffect, useState } from "react";
import { AptosContext } from "./context";

export function Balances() {
  const [balances, setBalances] = useState<{ coin: string; balance: number }[]>(
    []
  );
  const ctx = useContext(AptosContext);
  const [busy, setBusy] = useState(false);

  const disabled = busy || !ctx.address || !ctx.sdk;

  async function getBalances() {
    const sdk = ctx.sdk;
    if (!sdk) return;
    if (!ctx.address) return;
    setBusy(true);

    try {
      const bs = await sdk.client.allCoinBalances(ctx.address);
      setBalances(bs);
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    getBalances();
  }, [ctx.sdk, ctx.address]);

  return (
    <div>
      <table className="table is-bordered is-striped">
        <thead>
          <tr>
            <th>Coin</th>
            <th>Balance</th>
          </tr>
        </thead>
        <tbody>
          {balances.map((b, i) => (
            <tr key={i}>
              <td>{b.coin}</td>
              <td>{b.balance}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <button
        disabled={disabled}
        className="is-info button"
        onClick={getBalances}
      >
        Refresh
      </button>
    </div>
  );
}
