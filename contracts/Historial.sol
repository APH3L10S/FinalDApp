// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ToyDonationHistory {

    // Estructura para almacenar cada transacción de donación de juguete
    struct Donation {
        uint256 transactionId;
        address donor;
        address recipient;
        uint256 amount; // Cantidad del juguete donado (puede ser en unidades o tokens)
        uint256 timestamp; // Marca de tiempo de la transacción
    }

    // Array de donaciones realizadas
    Donation[] public donations;

    // Evento para registrar una nueva donación de juguete
    event DonationRecorded(uint256 transactionId, address indexed donor, address indexed recipient, uint256 amount, uint256 timestamp);

    // Función para añadir una nueva donación al historial
    function recordDonation(uint256 _transactionId, address _donor, address _recipient, uint256 _amount) external {
        donations.push(Donation({
            transactionId: _transactionId,
            donor: _donor,
            recipient: _recipient,
            amount: _amount,
            timestamp: block.timestamp
        }));

        emit DonationRecorded(_transactionId, _donor, _recipient, _amount, block.timestamp);
    }

    // Nueva función: Obtener el historial de donaciones por dirección de donante o receptor
    function getDonationHistoryByAddress(address _address) external view returns (Donation[] memory) {
        uint256 count = 0;

        // Contar las donaciones que involucran la dirección solicitada
        for (uint256 i = 0; i < donations.length; i++) {
            if (donations[i].donor == _address || donations[i].recipient == _address) {
                count++;
            }
        }

        // Crear un nuevo array para almacenar las donaciones que coincidan
        Donation[] memory result = new Donation[](count);
        uint256 index = 0;

        // Rellenar el array con las donaciones que coincidan
        for (uint256 i = 0; i < donations.length; i++) {
            if (donations[i].donor == _address || donations[i].recipient == _address) {
                result[index] = donations[i];
                index++;
            }
        }

        return result;
    }
}
