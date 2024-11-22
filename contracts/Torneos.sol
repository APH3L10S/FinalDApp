// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Torneos {
    struct Torneo {
        string nombre;
        uint256[] equipos;
    }

    mapping(uint256 => Torneo) public torneos;
    uint256 public torneoCount;

    function crearTorneo(string memory _nombre) public {
        torneos[torneoCount].nombre = _nombre;
        torneoCount++;
    }

    function agregarEquipo(uint256 _torneoId, uint256 _equipoId) public {
        torneos[_torneoId].equipos.push(_equipoId);
    }

    function obtenerTorneo(uint256 _torneoId)
        public
        view
        returns (Torneo memory)
    {
        return torneos[_torneoId];
    }
}
