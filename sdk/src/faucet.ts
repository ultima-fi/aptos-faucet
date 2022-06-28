import assert from "assert";
import { Account, RestClient } from "./aptos";
function stringToHex(text: string) {
  const encoder = new TextEncoder();
  const encoded = encoder.encode(text);
  return Array.from(encoded, (i) => i.toString(16).padStart(2, "0")).join("");
}

interface FunctionPayload {
  type: string;
  function: string;
  arguments: string[];
  type_arguments: string[];
}

export class FaucetClient {
  client: RestClient;
  constructor(url: string, public module_address: string) {
    this.client = new RestClient(url);
  }

  async initRoot(admin: Account) {
    assert(
      this.module_address === admin.address(),
      "Module owner must init program"
    );
    const payload = {
      type: "script_function_payload",
      function: `0x${admin.address()}::Faucet::init`,
    };
    const tx = await this.client.generateTransaction(admin.address(), payload);
    const signedTx = await this.client.signTransaction(admin, tx);
    const res = await this.client.submitTransaction(signedTx);
    return res["hash"];
  }

  createFaucetIX(
    name: string,
    symbol: string,
    decimals: number,
    coinType: string
  ): FunctionPayload {
    return {
      type: "script_function_payload",
      function: `0x${this.module_address}::Faucet::create_faucet_coin`,
      arguments: [stringToHex(name), stringToHex(symbol), decimals.toString()],
      type_arguments: [coinType],
    };
  }

  mintIX(coinType: string, amount: number): FunctionPayload {
    return {
      type: "script_function_payload",
      function: `0x${this.module_address}::Faucet::mint`,
      arguments: [amount.toString()],
      type_arguments: [coinType],
    };
  }

  pauseIX(coinType: string): FunctionPayload {
    return {
      type: "script_function_payload",
      function: `0x${this.module_address}::Faucet::pause`,
      arguments: [],
      type_arguments: [coinType],
    };
  }

  unpauseIX(coinType: string): FunctionPayload {
    return {
      type: "script_function_payload",
      function: `0x${this.module_address}::Faucet::unpause`,
      arguments: [],
      type_arguments: [coinType],
    };
  }

  registerIX(
    coinType: string,
    name: string,
    symbol: string,
    description: string,
    logoURL: string,
    decimals: number
  ): FunctionPayload {
    return {
      type: "script_function_payload",
      function: `0x${this.module_address}::Registry::put`,
      arguments: [
        stringToHex(name),
        stringToHex(symbol),
        stringToHex(description),
        stringToHex(logoURL),
        decimals.toString(),
      ],
      type_arguments: [coinType],
    };
  }

  async fetchFaucets(address: string) {
    const allResources = await this.client.resources(address);
    // ex "0x63b0f3351bdba3639c79cc2541a2af4d1531ed6bc854c383b354489a70458640::Faucet::Capabilities<0xd929c7ef372f9aa71f35b4bbc482cbf48077e2076a5e09769f7ccea14041b1be::CoinerTwo::CoinerTwo>"
    return allResources
      .map((x) => x.type)
      .filter((t) => t.includes(`${this.module_address}::Faucet::FaucetMeta`))
      .map((t) => t.split("FaucetMeta")[1]);
  }
}
