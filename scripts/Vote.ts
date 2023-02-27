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
    const proposal_num = args.slice(2);
    const contract = "0x76C3eE533bA35b40FB12Fa8ed1ba70Fa665Af7BF";
    if(proposal_num.length<=0) throw new Error("Missing args");
    const ballotContractFactory = new Ballot__factory(signer);
    const ballotContract = await ballotContractFactory.attach(contract);
    const voter = await ballotContract.voters(signer.address);
    if(voter.weight.toNumber() === 0) throw new Error("Has no right to vote");
    if(voter.voted) throw new Error("Already voted.");
    console.log(`Voting to proposal number ${proposal_num[0]}`);
    const obj = await ballotContract.vote(proposal_num[0]);
    console.log(`Successfully vote in blocknumber ${obj.blockNumber}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });