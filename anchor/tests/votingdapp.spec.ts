import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Keypair, PublicKey } from "@solana/web3.js";
import { BankrunProvider, startAnchor } from "anchor-bankrun";

import { Voting } from "anchor/target/types/voting";
const IDL = require("../target/idl/voting.json");

const votingAddress = new PublicKey(
  "AsjZ3kWAUSQRNt2pZVeJkywhZ6gpLpHZmJjduPmKZDZZ"
);

describe("voting", () => {
  let context;
  let provider: any;
  let votingProgram: any;

  beforeAll(async () => {
    context = await startAnchor(
      "",
      [{ name: "voting", programId: votingAddress }],
      []
    );

    provider = new BankrunProvider(context);
    votingProgram = new Program<Voting>(IDL as any, provider);
  });
  it("Initialize Poll", async () => {
    const pollId = new anchor.BN(1);

    const [pollAddress] = PublicKey.findProgramAddressSync(
      [pollId.toArrayLike(Buffer, "le", 8)],
      votingAddress
    );

    await votingProgram.methods
      .initializePoll(
        pollId,
        "What is your type of peanut butter?",
        new anchor.BN(0),
        new anchor.BN(1831003245)
      )
      .accounts({
        poll: pollAddress,
        signer: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    const poll = await votingProgram.account.poll.fetch(pollAddress);
    expect(poll.pollId.toNumber()).toBe(1);
  });

  it("initialize candidate", async () => {
    const pollId = new anchor.BN(1);

    // Get poll PDA
    const [pollAddress] = PublicKey.findProgramAddressSync(
      [pollId.toArrayLike(Buffer, "le", 8)],
      votingAddress
    );

    // Get candidate PDAs with correct seeds
    const [smoothAddress] = PublicKey.findProgramAddressSync(
      [pollId.toArrayLike(Buffer, "le", 8), Buffer.from("Smooth")],
      votingAddress
    );

    const [crunchyAddress] = PublicKey.findProgramAddressSync(
      [pollId.toArrayLike(Buffer, "le", 8), Buffer.from("Crunchy")],
      votingAddress
    );

    // Initialize candidates with all required accounts
    await votingProgram.methods
      .initializeCandidate("Smooth", pollId)
      .accounts({
        poll: pollAddress,
        candidate: smoothAddress,
        signer: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    await votingProgram.methods
      .initializeCandidate("Crunchy", pollId)
      .accounts({
        poll: pollAddress,
        candidate: crunchyAddress,
        signer: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    const smoothCandidate = await votingProgram.account.candidate.fetch(
      smoothAddress
    );
    const crunchyCandidate = await votingProgram.account.candidate.fetch(
      crunchyAddress
    );

    expect(smoothCandidate.candidateName).toBe("Smooth");
    expect(crunchyCandidate.candidateName).toBe("Crunchy");
  });
  it("vote", async () => {});
});
