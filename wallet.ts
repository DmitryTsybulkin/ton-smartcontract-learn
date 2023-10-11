import { getHttpEndpoint } from '@orbs-network/ton-access';
import { mnemonicToWalletKey } from 'ton-crypto';
import {fromNano, internal, TonClient, WalletContractV3R2} from 'ton';
import Constants from "./constants";

async function main() {
  const key = await mnemonicToWalletKey(Constants.mnemonic.split(' '));
  const wallet = WalletContractV3R2.create({
      publicKey: key.publicKey,
      workchain: 0
  });

  const endpoint = await getHttpEndpoint({ network: 'testnet' });
  const client = new TonClient({ endpoint });

  const balance = await client.getBalance(wallet.address);
  const walletContract = client.open(wallet);
  const seqno = await walletContract.getSeqno();

  console.log(balance);

  // if (!await client.isContractDeployed(wallet.address)) {
  //     return console.log('wallet is not deployed');
  // }
    // await walletContract.sendTransfer({
    //     secretKey: key.secretKey,
    //     seqno: seqno,
    //     messages: [
    //         internal({
    //             to: "EQA4V9tF4lY2S_J-sEQR7aUj9IwW-Ou2vJQlCn--2DLOLR5e",
    //             value: "0.05", // 0.05 TON
    //             body: "Dratuti", // optional comment
    //             bounce: false,
    //         })
    //     ]
    // });

  // let currentSeqno = seqno;
  // while (currentSeqno == seqno) {
  //     console.log('waiting for transaction to confirm...');
  //     await sleep(1500);
  //     currentSeqno = await walletContract.getSeqno();
  // }
  // console.log('transaction confirmed');
}

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

main();