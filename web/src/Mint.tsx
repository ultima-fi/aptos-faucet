import { useContext, useState } from "react";
import { AptosContext } from "./context";

export function Mint() {
  const [coinType, setCoinType] = useState("");
  const [amount, setAmount] = useState(0);

  const ctx = useContext(AptosContext);

  return <h3>Mint from faucet</h3>;
}
