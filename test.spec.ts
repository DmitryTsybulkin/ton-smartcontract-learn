import {Blockchain, SandboxContract, TreasuryContract} from "@ton-community/sandbox";
import Counter from "./counter";
import {Cell, toNano} from "ton-core";
import * as fs from "fs";

describe("Counter test", () => {
    let blockchain: Blockchain;
    let wallet1: SandboxContract<TreasuryContract>;
    let counterContract: SandboxContract<Counter>;

    beforeEach(async () => {
        const counterCode = Cell.fromBoc(fs.readFileSync('counter.debug.cell'))[0];
        const initialCounterValue = 17;
        const counter = Counter.createForDeploy(counterCode, initialCounterValue);

        blockchain = await Blockchain.create();
        blockchain.verbosity = {
            print: true,
            blockchainLogs: true,
            vmLogs: "vm_logs_full",
            debugLogs: true
        }
        wallet1 = await blockchain.treasury("user1");

        counterContract = blockchain.openContract(counter);
        await counterContract.sendDeploy(wallet1.getSender());
    });

    it.skip("should run the first test", async () => {});

    it.skip("should get counter value", async () => {
        const value = await counterContract.getCounter();
        expect(value).toEqual(17n);
    });

    it.skip("should increment counter value", async () => {
        await counterContract.sendIncrement(wallet1.getSender());
        const counter1 = await counterContract.getCounter();
        expect(counter1).toEqual(18n);
    });

    it("should send ton coin to the contract", async () => {
        console.log("sending 7.123 TON");
        await wallet1.send({
            to: counterContract.address,
            value: toNano("7.123")
        });
    });

    it("should increment the counter value", async () =>  {
        console.log("sending increment message");
        await counterContract.sendIncrement(wallet1.getSender());
    });
});