// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Equipos {
    struct Equipo {
        string nombre;
        string logoIPFS;
        address[] jugadores;
    }

    mapping(uint256 => Equipo) public equipos;
    uint256 public totalEquipos;

    function crearEquipo(string memory _nombre, string memory _logoIPFS) public {
        address;
        equipos[totalEquipos] = Equipo(_nombre, _logoIPFS, jugadoresVacios);
        totalEquipos++;
    }

    function obtenerEquipo(uint256 _id) public view returns (string memory, string memory, address[] memory) {
        Equipo memory equipo = equipos[_id];
        return (equipo.nombre, equipo.logoIPFS, equipo.jugadores);
    }
}
