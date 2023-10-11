import {getHttpEndpoint} from "@orbs-network/ton-access";
import {TonClient, WalletContractV3R2} from "ton";
import {mnemonicToWalletKey} from "ton-crypto";
import Constants from "./constants";
import {Address} from "ton-core";
import Counter from "./counter";

async function main() {
    const endpoint = await getHttpEndpoint({ network: "testnet" });
    const client = new TonClient({ endpoint });

    const key = await mnemonicToWalletKey(Constants.mnemonic.split(" "));
    const wallet = WalletContractV3R2.create({ publicKey: key.publicKey, workchain: 0 });
    if (!await client.isContractDeployed(wallet.address)) {
        return console.log("wallet is not deployed");
    }

    const walletContract = client.open(wallet);
    const walletSender = walletContract.sender(key.secretKey);
    const seqno = await walletContract.getSeqno();

    // open Counter instance by address
    const counterAddress = Address.parse(Constants.contractAddress);
    const counter = new Counter(counterAddress);
    const counterContract = client.open(counter);

    await counterContract.sendIncrement(walletSender);

    let currentSeqno = seqno;
    while (currentSeqno == seqno) {
        console.log("waiting for transaction to confirm...");
        await sleep(1500);
        currentSeqno = await walletContract.getSeqno();
    }
    console.log("transaction confirmed!");
}

main();

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}