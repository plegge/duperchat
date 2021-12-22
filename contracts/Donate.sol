//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract Donate {
    struct Message {
      uint value;
      address from;
      string message;
    }

    address private _owner;

    Message[] private _messages;

    mapping (address => Message) messages;

    constructor() {
        _owner = msg.sender;
        console.log("Deploying Donate:", _owner);
    }

    function getOwner() public view returns (address) {
        return _owner;
    }

    function setOwner(address owner) public {
        console.log("Changing owner from '%s' to '%s'", _owner, owner);
        _owner = owner;
    }

    function withdrawBalance() external payable {
        require(_owner == msg.sender);
        payable(msg.sender).transfer(address(this).balance);
    }

    function getTotalBalance() public view returns (uint) {
        return address(this).balance;
    }

    function getTotalMessages() public view returns (uint) {
        return _messages.length;
    }

    function getMessage(uint index) public view returns (Message memory) {
        return _messages[index];
    }

    function sendMessage(string memory _message) public payable {
        _messages.push(Message({
            value: msg.value,
            from: msg.sender,
            message: _message
        }));
    }

}
