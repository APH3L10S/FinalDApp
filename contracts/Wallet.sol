// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Wallet {
    address public owner;

    event Deposit(address indexed sender, uint amount);
    event Withdrawal(address indexed to, uint amount);

    constructor() {
        owner = msg.sender; // Asignar el creador del contrato como propietario
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Solo el propietario puede realizar esta accion");
        _;
    }

    function deposit() public payable {
        require(msg.value > 0, "Debe enviar Ether");
        emit Deposit(msg.sender, msg.value);
    }

    function withdraw(uint _amount) public onlyOwner {
        require(address(this).balance >= _amount, "Fondos insuficientes");
        payable(owner).transfer(_amount);
        emit Withdrawal(owner, _amount);
    }
}
