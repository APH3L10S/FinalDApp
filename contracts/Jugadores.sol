// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Jugadores {
    struct Jugador {
        string nombre;
        string nickname;
        string rol;
        string nacionalidad;
        string imagenIPFS;
    }

    mapping(address => Jugador) public jugadores;

    function registrarJugador(
        address _direccion,
        string memory _nombre,
        string memory _nickname,
        string memory _rol,
        string memory _nacionalidad,
        string memory _imagenIPFS
    ) public {
        jugadores[_direccion] = Jugador(_nombre, _nickname, _rol, _nacionalidad, _imagenIPFS);
    }

    function obtenerJugador(address _direccion) public view returns (string memory, string memory, string memory, string memory, string memory) {
        Jugador memory jugador = jugadores[_direccion];
        return (jugador.nombre, jugador.nickname, jugador.rol, jugador.nacionalidad, jugador.imagenIPFS);
    }
}
