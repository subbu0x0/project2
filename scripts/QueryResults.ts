import { ethers } from "ethers";
import * as dotenv from 'dotenv';
import { Ballot__factory } from "../typechain-types";
dotenv.config();


async function main(){
    const provider = new ethers.providers.InfuraProvider(
        "goerli",
        process.env.INFURA_API_KEY);
    const privateKey = process.env.PRIVATE_KEY;
    if(!privateKey || privateKey.length<=0)
            throw new Error("Private Key Not Found");
    const wallet = new ethers.Wallet(privateKey);
    const signer = wallet.connect(provider);
    const contract = "0x76C3eE533bA35b40FB12Fa8ed1ba70Fa665Af7BF";
    const ballotContractFactory = new Ballot__factory(signer);
    const ballotContract = await ballotContractFactory.attach(contract);
    const winner = await ballotContract.winnerName();
    const winningProposal = await ballotContract.winningProposal();
    console.log(`The winner of the voting is Proposal ${winningProposal.toNumber()+1}: ${ethers.utils.parseBytes32String(winner)}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });