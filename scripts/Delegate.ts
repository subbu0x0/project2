import { ethers } from "ethers";
import * as dotenv from 'dotenv';
import { Ballot__factory } from "../typechain-types";
dotenv.config();

async function main() {
    const provider = new ethers.providers.InfuraProvider(
        "goerli",
        process.env.INFURA_API_KEY);
    const privateKey = process.env.PRIVATE_KEY;
    if(!privateKey || privateKey.length<=0)
            throw new Error("Private Key Not Found");
    const wallet = new ethers.Wallet(privateKey);
    const signer = wallet.connect(provider);
    const args  = process.argv;
    const delegate_to = args.slice(2);
    const contract = "0x76C3eE533bA35b40FB12Fa8ed1ba70Fa665Af7BF";
    if(delegate_to.length<=0) throw new Error("Missing args");
    const ballotContractFactory = new Ballot__factory(signer);
    const ballotContract = await ballotContractFactory.attach(contract);
    const voter = await ballotContract.voters(signer.address)
    if(voter.weight.toNumber() == 0) throw new Error("You have no right to vote");
    console.log(voter.voted)
    if(voter.voted) throw new Error("You already voted.");
    if(delegate_to[0] == signer.address) throw new Error("Self-delegation is disallowed.");
    const delegate = await ballotContract.voters(delegate_to[0]);
    if(delegate.weight.toNumber() == 0) throw new Error("Cannot delegate to accounts that cannot vote.");
    if(delegate.delegate == delegate_to[0]) throw new Error("Found loop in delegation.");
    console.log("Delegating....");
    const tx = await (await ballotContract.delegate(delegate_to[0])).wait();
    console.log(`Successfully delegated to address ${delegate_to[0]} in the block number ${tx.blockNumber}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });