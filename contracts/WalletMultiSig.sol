// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IToyDonationHistory {
    function recordDonation(uint256 _transactionId, address _donor, address _recipient, uint256 _amount) external;
}

contract ToyDonationMultiSig {
    address[] public owners;
    uint public requiredApprovals;
    mapping(address => bool) public isOwner;
    IToyDonationHistory public toyDonationHistory;

    enum TransactionState { Pending, Approved, Executed }

    struct Transaction {
        address to; // Destinatario
        uint amount; // Cantidad del juguete donado (en unidades o valor)
        uint approvalCount; // Número de aprobaciones
        bool executed; // Estado de la transacción
        TransactionState state; // Estado de la transacción
    }

    Transaction[] public transactions;
    mapping(uint256 => mapping(address => bool)) public approvals;
    event TransactionSubmitted(uint transactionId, address indexed to, uint amount);
    event TransactionApproved(uint transactionId, address indexed owner);
    event TransactionExecuted(uint transactionId, address indexed to, uint amount);
    event Deposit(address indexed sender, uint amount);

    constructor(address[] memory _owners, uint _requiredApprovals, address _toyDonationHistoryAddress) {
        require(_owners.length > 0, "Debe haber al menos un owner");
        require(_requiredApprovals > 0 && _requiredApprovals <= _owners.length, "Numero invalido de aprobaciones");
        require(_toyDonationHistoryAddress != address(0), "Direccion de historial invalida");

        for (uint i = 0; i < _owners.length; i++) {
            address owner = _owners[i];
            require(owner != address(0), "Direccion de owner invalida");
            require(!isOwner[owner], "Owner duplicado");

            isOwner[owner] = true;
            owners.push(owner);
        }
        requiredApprovals = _requiredApprovals;
        toyDonationHistory = IToyDonationHistory(_toyDonationHistoryAddress);
    }

    modifier onlyOwner() {
        require(isOwner[msg.sender], "No es un owner");
        _;
    }

    // Función para enviar una transacción
    function submitTransaction(address _to, uint _amount) public onlyOwner {
        transactions.push(Transaction({
            to: _to,
            amount: _amount,
            approvalCount: 0,
            executed: false,
            state: TransactionState.Pending
        }));

        emit TransactionSubmitted(transactions.length - 1, _to, _amount);
    }

    // Función para aprobar una transacción
    function approveTransaction(uint _transactionId) public onlyOwner {
        Transaction storage transaction = transactions[_transactionId];
        require(!transaction.executed, "La transaccion ya fue ejecutada");
        require(!approvals[_transactionId][msg.sender], "Ya aprobaste esta transaccion");

        approvals[_transactionId][msg.sender] = true;
        transaction.approvalCount += 1;

        if (transaction.approvalCount >= requiredApprovals) {
            transaction.state = TransactionState.Approved;
        }

        emit TransactionApproved(_transactionId, msg.sender);
    }

    // Función para ejecutar una transacción aprobada
    function executeTransaction(uint _transactionId) public onlyOwner {
        Transaction storage transaction = transactions[_transactionId];
        require(transaction.state == TransactionState.Approved, "No se han aprobado suficientes transacciones");
        require(!transaction.executed, "La transaccion ya fue ejecutada");

        transaction.executed = true;
        transaction.state = TransactionState.Executed;

        // Ejecutar la transferencia
        (bool success, ) = transaction.to.call{value: transaction.amount}("");
        require(success, "Fallo en la transferencia de fondos");

        emit TransactionExecuted(_transactionId, transaction.to, transaction.amount);

        // Registrar la donación en el contrato de historial
        toyDonationHistory.recordDonation(_transactionId, msg.sender, transaction.to, transaction.amount);
    }

    // Función para depositar fondos en el contrato
    function deposit() public payable {
        require(msg.value > 0, "Debe enviar un valor mayor a 0");
        emit Deposit(msg.sender, msg.value);
    }

    // Función para obtener el estado de la transacción
    function getTransactionState(uint _transactionId) public view returns (TransactionState) {
        return transactions[_transactionId].state;
    }

    // Función para obtener detalles de la transacción
    function getTransaction(uint _transactionId) public view returns (address to, uint amount, uint approvalCount, bool executed, TransactionState state) {
        Transaction storage transaction = transactions[_transactionId];
        return (transaction.to, transaction.amount, transaction.approvalCount, transaction.executed, transaction.state);
    }

    // Función para obtener todos los owners
    function getOwners() public view returns (address[] memory) {
        return owners;
    }

    // Función para obtener todas las transacciones
    function getTransactions() public view returns (Transaction[] memory) {
        return transactions;
    }
}
