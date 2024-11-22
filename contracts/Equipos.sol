// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Equipos {
    struct Equipo {
        string nombre;
        address[] jugadores;
    }

    mapping(uint256 => Equipo) public equipos;
    uint256 public equipoCount;

    function crearEquipo(string memory _nombre) public {
        equipos[equipoCount].nombre = _nombre;
        equipoCount++;
    }

    function agregarJugador(uint256 _equipoId, address _jugador) public {
        equipos[_equipoId].jugadores.push(_jugador);
    }

    function obtenerEquipo(uint256 _equipoId)
        public
        view
        returns (Equipo memory)
    {
        return equipos[_equipoId];
    }
}
