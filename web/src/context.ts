import { FaucetClient } from "@ultima-fi/faucet";
import { createContext } from "react";

export interface IAptoseContext {
  address: string;
  sdk: undefined | FaucetClient;
}

export const AptosContext = createContext<IAptoseContext>({
  address: "",
  sdk: undefined,
});
