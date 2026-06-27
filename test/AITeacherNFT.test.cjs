const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AI Teacher NFT", function () {
  let nft;
  let owner;
  let user1;

  beforeEach(async function () {
    [owner, user1] = await ethers.getSigners();

    const AITeacherNFT = await ethers.getContractFactory("AITeacherNFT");
    nft = await AITeacherNFT.deploy();
    await nft.waitForDeployment();
  });

  it("Should deploy contract correctly", async function () {
    expect(await nft.getTotalSupply()).to.equal(0n);
  });

  it("Should mint AI Teacher NFT", async function () {
    await nft.mintTeacher(
      user1.address,
      "Alice",
      "Blockchain",
      "ipfs://test-uri"
    );

    const teacher = await nft.getTeacher(0);

    expect(teacher.name).to.equal("Alice");
    expect(teacher.specialization).to.equal("Blockchain");
    expect(teacher.level).to.equal(1n);
  });

  it("Should only allow owner to mint", async function () {
    await expect(
      nft.connect(user1).mintTeacher(
        user1.address,
        "Bob",
        "AI",
        "ipfs://test"
      )
    ).to.be.reverted;
  });

  it("Should increase experience and level up", async function () {
    await nft.mintTeacher(
      user1.address,
      "Alice",
      "Blockchain",
      "ipfs://test"
    );

    await nft.addExperience(0, 150);

    const teacher = await nft.getTeacher(0);

    expect(teacher.experience).to.equal(150n);
    expect(teacher.level).to.equal(2n);
  });

  it("Should add skills", async function () {
    await nft.mintTeacher(
      user1.address,
      "Alice",
      "Blockchain",
      "ipfs://test"
    );

    await nft.addSkill(0, "Solidity");

    const skills = await nft.getSkills(0);

    expect(skills.length).to.equal(1);
  });
});