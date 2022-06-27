import { Contract, ethers } from "ethers";
import "dotenv/config";
import * as ballotJson from "../../artifacts/contracts/Ballot.sol/Ballot.json";
// eslint-disable-next-line node/no-missing-import
import { Ballot } from "../../typechain";

// 0xA02102E1519E1B03467bbfE0698A4275Ce6A904E is the deployed contract address on Ropsten

// This key is already public on Herong's Tutorial Examples - v1.03, by Dr. Herong Yang
// Do never expose your keys like this
const EXPOSED_KEY =
  "8da4ef21b864d2cc526dbdb2a120bd2874c36c9d0a1fb7f8c63d7f7a8b41de8f";

async function main() {
  // create wallet
  const wallet =
    process.env.MNEMONIC && process.env.MNEMONIC.length > 0
      ? ethers.Wallet.fromMnemonic(process.env.MNEMONIC)
      : new ethers.Wallet(process.env.PRIVATE_KEY ?? EXPOSED_KEY);
  console.log(`Using address ${wallet.address}`);
  // create provider
  // const provider = ethers.providers.getDefaultProvider("ropsten");
  const provider = new ethers.providers.JsonRpcProvider(process.env.ROPSTEN_URL);
  const signer = wallet.connect(provider);
  const balanceBN = await signer.getBalance();
  const balance = Number(ethers.utils.formatEther(balanceBN));
  console.log(`Wallet balance ${balance}`);
  if (balance < 0.01) {
    throw new Error("Not enough ether");
  }
  if (process.argv.length < 3) throw new Error("Ballot address missing");
  const ballotAddress = process.argv[2];

  // create contract instance
  console.log(
    `Attaching ballot contract interface to address ${ballotAddress}`
  );
  const ballotContract: Ballot = new Contract(
    ballotAddress,
    ballotJson.abi,
    signer
  ) as Ballot;

  console.log("The proposals are:");

  // loop through Proposal array and print the members as strings:
  try {
    let i: number = 0;
    let name: string;
    let voteCount: string;
    let proposal;
    while (true) {
      proposal = await ballotContract.proposals(i);
      name = ethers.utils.parseBytes32String(proposal.name);
      voteCount = proposal.voteCount.toString();
      console.log(`Name: ${name}, vote count: ${voteCount}`);
      i++;
    }
  } catch (error) {
    console.log("End of proposals array reached...");
    console.log("------------------------------------------");
  }
}

main().catch((error) => {
  console.log(error);
});
