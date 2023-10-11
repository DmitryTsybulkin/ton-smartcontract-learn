import {getHttpEndpoint} from "@orbs-network/ton-access";
import {TonClient, WalletContractV3R1, WalletContractV3R2} from "ton";
import {Cell} from "ton-core";
import * as fs from "fs";
import Counter from "./counter";
import {mnemonicToWalletKey} from "ton-crypto";
import Constants from "./constants";

async function deploy() {
    const endpoint = await getHttpEndpoint({ network: 'testnet' });
    const tonClient = new TonClient({ endpoint });

    const counterCode = Cell.fromBoc(fs.readFileSync('counter.cell'))[0];
    const initialCounterValue = Date.now();
    const counter = Counter.createForDeploy(counterCode, initialCounterValue);

    console.log(`contract address: ${counter.address.toString()}`);
    if (await tonClient.isContractDeployed(counter.address)) {
        return console.log('Counter already deployed');
    }
    const key = await mnemonicToWalletKey(Constants.mnemonic.split(' '));
    const wallet = WalletContractV3R2.create({ publicKey: key.publicKey, workchain: 0 });
    if (!await tonClient.isContractDeployed(wallet.address)) {
        return console.log("wallet is not deployed");
    }

    const walletContract = tonClient.open(wallet);
    const walletSender = walletContract.sender(key.secretKey);
    const seqno = await walletContract.getSeqno();

    const counterContract = tonClient.open(counter);
    await counterContract.sendDeploy(walletSender);

    let currentSeqno = seqno;
    while (currentSeqno == seqno) {
        console.log("waiting for deploy transaction to confirm...");
        await sleep(1500);
        currentSeqno = await walletContract.getSeqno();
    }
    console.log('deploy transaction successfully');
}

deploy();

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}