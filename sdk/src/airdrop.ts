import assert from "assert";
import { Account, RestClient } from "./aptos";

export class AirdropClient {
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
      function: `0x${admin.address()}::Airdrop::init`,
    };
    const tx = await this.client.generateTransaction(admin.address(), payload);
    const signedTx = await this.client.signTransaction(admin, tx);
    const res = await this.client.submitTransaction(signedTx);
    return res["hash"];
  }

  async createAirdropIX(
    name: string,
    symbol: string,
    decimals: number,
    coinType: string
  ) {
    return {
      type: "script_function_payload",
      function: `0x${this.module_address}::Airdrop::create_airdrop`,
      arguments: [name, symbol, decimals.toString()],
      type_arguments: [coinType],
    };
  }

  async airdropIX(coinType: string, amount: number) {
    return {
      type: "script_function_payload",
      function: `0x${this.module_address}::Airdrop::airdrop`,
      arguments: [amount.toString()],
      type_arguments: [coinType],
    };
  }
}
