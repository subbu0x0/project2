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
    const balance = await signer.getBalance();
    console.log(`${signer.address}${balance}`);
    const args  = process.argv;
    const proposals = args.slice(2);
    if(proposals.length<=0) throw new Error("Missing args");
    console.log("Deploying Ballot contract");
    console.log("Proposals: ");
    proposals.forEach((element, index) => {
    console.log(`Proposal N. ${index + 1}: ${element}`);
  });
    const ballotContractFactory = new Ballot__factory(signer);
    console.log("Deploying ballot contract");
    const ballotContract = await ballotContractFactory.deploy(
        proposals.map((proposal)=>ethers.utils.formatBytes32String(proposal))
      );
    console.log("Awaiting Deploying ballot contract");
    const tx = await ballotContract.deployTransaction.wait();
    console.log(`Deploying ballot contract at address ${ballotContract.address} in the block number ${tx.blockNumber}`);

    }

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});