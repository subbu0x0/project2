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
    const voter_address = args.slice(2);
    const contract = "0x76C3eE533bA35b40FB12Fa8ed1ba70Fa665Af7BF";
    if(voter_address.length<=0) throw new Error("Missing args");
    const ballotContractFactory = new Ballot__factory(signer);
    const ballotContract = await ballotContractFactory.attach(contract);
    const chairperson = await ballotContract.chairperson();
    if(chairperson != signer.address) throw new Error("Only chairperson can give right to vote.");
    const obj = await ballotContract.voters(voter_address[0]);
    if(obj.weight.toNumber() === 1) throw new Error("can not give right to vote for someone that has already voting rights");
    if(obj.voted) throw new Error("can not give right to vote for someone that has voted");
    console.log("Giving voting rights....");
    const tx = await (await ballotContract.giveRightToVote(voter_address[0])).wait();
    console.log(`Successfully gave voting rights to address ${voter_address[0]} in the block number ${tx.blockNumber}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });