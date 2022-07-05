import { useContext, useEffect, useState } from "react";
import { AptosContext } from "./context";

export function LowBalanceWarning() {
  const ctx = useContext(AptosContext);
  const [hasLowBalance, setHasLowBalance] = useState(false);

  useEffect(() => {
    if (!ctx.sdk || !ctx.address) return;
    ctx.sdk.client.accountBalance(ctx.address).then((b) => {
      if (!b || b < 10) {
        setHasLowBalance(true);
      }
    });
  }, [ctx.sdk, ctx.address]);

  return !hasLowBalance ? (
    <></>
  ) : (
    <div className="is-danger notification">
      You have a low balance of TestCoins. Please use the faucet to airdrop
      yourself TestCoins in order to pay transaction fees.
    </div>
  );
}
