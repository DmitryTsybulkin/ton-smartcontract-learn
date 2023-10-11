import {getHttpEndpoint} from "@orbs-network/ton-access";
import {TonClient} from "ton";
import {Address} from "ton-core";
import Counter from "./counter";
import Constants from "./constants";

async function main() {
    const endpoint = await getHttpEndpoint({ network: 'testnet' });
    console.log(`endpoint: ${endpoint}`);

    const client = new TonClient({ endpoint });

    const address = Address.parse(Constants.contractAddress);
    const counter = new Counter(address);
    const contract = client.open(counter);

    const counterValue = await contract.getCounter();
    console.log(`value: ${counterValue.toString()}`); // 1691691905452 1691691905453
}

main();