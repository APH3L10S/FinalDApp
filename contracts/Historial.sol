// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Historial {

    struct Transaccion {
        uint256 idNFT;
        address from;
        address to;
        uint256 amount;
        string tipo; // "Creación", "Transferencia"
        uint256 timestamp;
    }

    Transaccion[] public historialTransacciones;

    // Función para registrar una transacción
    function registrarTransaccion(uint256 _idNFT, address _from, address _to, uint256 _amount, string memory _tipo) public {
        historialTransacciones.push(Transaccion({
            idNFT: _idNFT,
            from: _from,
            to: _to,
            amount: _amount,
            tipo: _tipo,
            timestamp: block.timestamp
        }));
    }

    // Función para consultar el historial de transacciones
    function consultarHistorial() public view returns (Transaccion[] memory) {
        return historialTransacciones;
    }
}
