import { Provider } from "@ethersproject/providers";
import { expect } from "chai";
import { Signer } from "ethers";
import { ethers } from "hardhat";
import { Ballot } from "../typechain-types";
import { PromiseOrValue } from "../typechain-types/common";

const PROPOSALS = ["Proposal 1","Proposal 2","Proposal 3"]
describe("Ballot", function (){
    let ballotContract : Ballot;
    beforeEach(async () => {
        const ballotContractFactory = await ethers.getContractFactory("Ballot");
        ballotContract = await ballotContractFactory.deploy(
            PROPOSALS.map((proposal)=>ethers.utils.formatBytes32String(proposal))
           // [
            //ethers.utils.formatBytes32String("Proposal 1"),
            //ethers.utils.formatBytes32String("Proposal 2"),
            //ethers.utils.formatBytes32String("Proposal 3")]
            );
            await ballotContract.deployTransaction.wait();
    });
  describe("when the contract is deployed", function () {
    it("has the provided proposals", async function () {
        for(let i = 0; i<PROPOSALS.length;i++){
            const proposals0 = await ballotContract.proposals(i);
            expect(ethers.utils.parseBytes32String(proposals0.name)).to.
            eq(PROPOSALS[i]);
        }
    });
    it("has zero votes for all the provided proposals", async function () {
        for(let i = 0; i<PROPOSALS.length;i++){
            const proposals0 = await ballotContract.proposals(i);
            expect(proposals0.voteCount).to.
            eq(0);
        }
    });
    it("sets the deployer address to chairperson", async function () {
        const signers = await ethers.getSigners();
        const deployeraddress = signers[0].address;
        const chairperson = await ballotContract.chairperson();
        expect(chairperson).to.eq(deployeraddress);
    });
    it("sets voting weight for chairperson to 1",async()=>{
        const chairperson = await ballotContract.chairperson();
        const obj = await ballotContract.voters(chairperson);
        expect(obj.weight).to.eq(1);

    });
});
describe("when the chairperson interacts with the giveRightToVote function in the contract", function () {
    let signers: { address: string; }[];
    let chairperson: string | Signer | Provider;
    this.beforeEach(async ()=>{
        chairperson = await ethers.getSigner(await ballotContract.chairperson());
        signers = await ethers.getSigners();
        await ballotContract.connect(chairperson).giveRightToVote(signers[1].address);
    });
    it("gives right to vote for another address", async function () {
        const obj = await ballotContract.voters(signers[1].address);
        expect(obj.weight).to.eq(1);
    });
    it("can not give right to vote for someone that has voted", async function () {
        await ballotContract.connect(await ethers.getSigner(signers[1].address)).vote(1);
        expect(ballotContract.connect(chairperson).giveRightToVote(signers[1].address)).to.be.revertedWith("The voter already voted.");
    });
    it("can not give right to vote for someone that has already voting rights", async function () {
      expect(ballotContract.connect(chairperson).giveRightToVote(signers[1].address)).to.be.reverted;
    });
  });
  describe("when the voter interact with the vote function in the contract", function () {
    it("should register the vote", async () => {
        const chairperson = await ethers.getSigner(await ballotContract.chairperson());
        const signers = await ethers.getSigners();
        await ballotContract.connect(chairperson).giveRightToVote(signers[1].address);
        await ballotContract.connect(await ethers.getSigner(signers[1].address)).vote(1);
        const proposals0 = await ballotContract.proposals(1);
        expect(proposals0.voteCount).to.eq(1);
    });
  });
});


