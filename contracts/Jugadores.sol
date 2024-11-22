// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Jugadores {
    struct Jugador {
        string nombre;
        string nickname;
        string rol;
        string nacionalidad;
    }

    mapping(address => Jugador) public jugadores;

    function registrarJugador(
        address _jugador,
        string memory _nombre,
        string memory _nickname,
        string memory _rol,
        string memory _nacionalidad
    ) public {
        jugadores[_jugador] = Jugador(_nombre, _nickname, _rol, _nacionalidad);
    }

    function obtenerJugador(address _jugador)
        public
        view
        returns (Jugador memory)
    {
        return jugadores[_jugador];
    }
}
