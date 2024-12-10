// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Wallet {

    address[] public owners;
    mapping(address => bool) public isOwner;
    uint public numConfirmationsRequired;

    struct Transaction {
        address to;
        uint amount;
        bool executed;
        uint numConfirmations;
    }

    mapping(uint => Transaction) public transactions;
    uint public transactionCount;

    constructor(address[] memory _owners, uint _numConfirmationsRequired) {
        owners = _owners;
        numConfirmationsRequired = _numConfirmationsRequired;

        for (uint i = 0; i < _owners.length; i++) {
            isOwner[_owners[i]] = true;
        }
    }

    modifier onlyOwner() {
        require(isOwner[msg.sender], "Solo los propietarios pueden ejecutar esta funcion");
        _;
    }

    modifier transactionExists(uint _transactionId) {
        require(_transactionId < transactionCount, "La transaccion no existe");
        _;
    }

    modifier notExecuted(uint _transactionId) {
        require(!transactions[_transactionId].executed, "La transaccion ya fue ejecutada");
        _;
    }

    // Función para crear una nueva transacción
    function submitTransaction(address _to, uint _amount) public onlyOwner {
        uint transactionId = transactionCount;
        transactions[transactionId] = Transaction({
            to: _to,
            amount: _amount,
            executed: false,
            numConfirmations: 0
        });

        transactionCount++;
    }

    // Función para aprobar una transacción
    function confirmTransaction(uint _transactionId) public onlyOwner transactionExists(_transactionId) notExecuted(_transactionId) {
        Transaction storage transaction = transactions[_transactionId];
        transaction.numConfirmations += 1;

        if (transaction.numConfirmations >= numConfirmationsRequired) {
            transaction.executed = true;
            payable(transaction.to).transfer(transaction.amount);
        }
    }

    // Función para consultar el saldo
    function consultarSaldo() public view returns (uint) {
        return address(this).balance;
    }

    // Función para depositar gas en la wallet
    function depositarGas() public payable {
    }

    // Función para transferir un NFT (intermediario)
    function transferirNFT(address _from, address _to, uint256 tokenId) public onlyOwner {
        // Implementar lógica para transferir NFTs entre equipos.
    }
}
