const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Khởi tạo smartcontract", function () {
  let deployer, user, attacker;

  beforeEach(async function () {
    [deployer, user, attacker] = await ethers.getSigners();

    const BankFactory = await ethers.getContractFactory("Bank", deployer);
    this.bankContract = await BankFactory.deploy();

    await this.bankContract.deposit({ value: ethers.utils.parseEther("1000") });
    await this.bankContract
      .connect(user)
      .deposit({ value: ethers.utils.parseEther("50") });

    const AttackerFactory = await ethers.getContractFactory(
      "Attacker",
      attacker
    );
    this.attackerContract = await AttackerFactory.deploy(
      this.bankContract.address
    );
  });

  describe("Test rút tiền", function () {
    it("Chấp nhận gửi tiền", async function () {
      const deployerBalance = await this.bankContract.balanceOf(
        deployer.address
      );
      expect(deployerBalance).to.eq(ethers.utils.parseEther("1000"));

      const userBalance = await this.bankContract.balanceOf(user.address);
      expect(userBalance).to.eq(ethers.utils.parseEther("50"));
    });

    it("Chấp nhận rút tiền", async function () {
      await this.bankContract.withdraw();

      const deployerBalance = await this.bankContract.balanceOf(
        deployer.address
      );
      const userBalance = await this.bankContract.balanceOf(user.address);

      expect(deployerBalance).to.eq(0);
      expect(userBalance).to.eq(ethers.utils.parseEther("50"));
    });

    it("Tấn công thành công", async function () {
      console.log("");
      console.log("*** Trước khi tấn công ***");
      console.log(
        `Số dư trong ngân hàng: ${ethers.utils
          .formatEther(
            await ethers.provider.getBalance(this.bankContract.address)
          )
          .toString()}`
      );
      console.log(
        `Số dư của attacker: ${ethers.utils
          .formatEther(await ethers.provider.getBalance(attacker.address))
          .toString()}`
      );

      await this.attackerContract.attack({
        value: ethers.utils.parseEther("10"),
      });

      console.log("");
      console.log("*** Sau khi tấn công ***");
      console.log(
        `Số dư của ngân hàng: ${ethers.utils
          .formatEther(
            await ethers.provider.getBalance(this.bankContract.address)
          )
          .toString()}`
      );
      console.log(
        `Số dư của attacker: ${ethers.utils
          .formatEther(await ethers.provider.getBalance(attacker.address))
          .toString()}`
      );
      console.log("");

      expect(await ethers.provider.getBalance(this.bankContract.address)).to.eq(
        0
      );
    });
  });
});
