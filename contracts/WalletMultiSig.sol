/*Lunes, 11 de Noviembre de 2024 - CONTRATO: Wallet (Billetera)
En teoría es un contrato para una billetera multifirma
Cada transacción va a requerir de ciertas aprobaciones
Solo los dueños podrán afirmar/aprobar que una transacción se pueda realizar*/

// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity >=0.8.0 < 0.9.0; //^0.8.0;

//Contrato Billetera Multifirma
contract WalletMultiSig{
    address[] public owners; //Arreglo de direcciones, van a ser las cuentas dueñas
    uint public requiredApprovals; //Número de aprobaciones requeridas
    mapping(address => bool) public isOwner;
    //Mapa de las condiciones para ser dueño, mapa de direcciones, va a tener como referencia un valor booleano

    struct Transaction { //Estructura de la transacción
        address to; //A quién va dirigido
        uint amount; //Cantidad de la transacción (en Weis), cuánto le vamos a mandar
        uint approvalCount; //Cantidad de aprobaciones de la transacción
        bool executed;
    }

    //Variables que vamos a utilizar
    Transaction[] public transactions;
    mapping(uint => mapping(address => bool)) public approvals; //Mapa de mapas, direcciones de quiénes han aprobado las transacciones
    event Deposit(address indexed sender, uint amount); //Declarar un evento de depositar

    //En el constructor recibiremos un arreglo de direcciones (los dueños), y un número entero, el número de aprobaciones requeridas
    constructor(address[] memory _owners, uint _requiredApprovals) {
        require(_owners.length > 0, "Debes tener owners"); //Tener al menos un dueño
        require(_requiredApprovals > 0 && _requiredApprovals <= _owners.length, "Número inválido de aprobaciones"); //Para que no haya error de lógica
        for(uint i = 0; i < _owners.length; i++) {
            isOwner[_owners[i]] = true; //Por cada dirección de los dueños, lo vamos a insertar en el mapa de isOwner
        }
        owners = _owners;
        requiredApprovals = _requiredApprovals;
    }
    
    //MODIFICADOR
    modifier onlyOwner() {
        require(isOwner[msg.sender], "No es un owner"); //El sender lo comparamos con el mapa, y nos regresará "true" o "false"
        _;
    }

    //Crear las funciones - Función
    function submitTransaction(address _to, uint amount) public onlyOwner {
        //Crear una transacción
        transactions.push(Transaction({
            to: _to,
            amount: _amount,
            approvalCount: 0, //No tenemos ninguna aprobación todavía
            executed: false
        }));
    }

    function approveTransaction(uint _transactionId) public onlyOwner {
        Transaction storage transaction = transactions[_transactionId];
        require(!transaction.executed, "Transacción ya ejecutada");
        require(!approvals[_transactionId][msg.sender], "Ya aprobada");
        approvals[_transactionId][msg.sender] = true; //Ese dueño ya aprobó la transacción
        transaction.approvalCount += 1;
    }

    function executeTransaction(uint _transactionId) public onlyOwner {
        Transaction storage transaction = transactions[_transactionId];
        require(transaction.approvalCount => requiredApprovals, "No hay suficientes aprobaciones");
        require(transaction.executed, "Transacción ya ejecutada");

        transaction.executed = true;
        payable(transaction.to).transfer(transaction.amount);
        //El contrato, de sus fondos, va a pasar el dinero al destino
    }

    //Unico método que retorna algo
    function getTransactions() public view returns (Transaction[] memory) {
        return transactions; //Regresamos un arreglo
    }

    //Función que va ligada al evento, función de depositar
    function deposit() public payable {
        require(msg.value > 0, "Debes mandar Ether");
        emit Deposit(msg.sender, msg.value);
    }
}

