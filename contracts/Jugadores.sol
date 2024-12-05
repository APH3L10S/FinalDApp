// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Jugadores {
    struct Jugador {
        string nombre;
        string nickname;
        string rol;
        string nacionalidad;
        string imagenIPFS; // URL o hash para almacenar la imagen del jugador
    }

    mapping(address => Jugador) public jugadores;

    // Eventos
    event JugadorRegistrado(address indexed id, string nombre, string nickname);
    event JugadorActualizado(address indexed id, string nombre, string nickname);
    event JugadorEliminado(address indexed id);

    // Registrar un jugador
    function registrarJugador(
        address _id,
        string memory _nombre,
        string memory _nickname,
        string memory _rol,
        string memory _nacionalidad,
        string memory _imagenIPFS
    ) public {
        require(bytes(jugadores[_id].nombre).length == 0, "Jugador ya registrado");
        jugadores[_id] = Jugador(_nombre, _nickname, _rol, _nacionalidad, _imagenIPFS);
        emit JugadorRegistrado(_id, _nombre, _nickname);
    }

    // Actualizar datos de un jugador
    function actualizarJugador(
        address _id,
        string memory _nombre,
        string memory _nickname,
        string memory _rol,
        string memory _nacionalidad,
        string memory _imagenIPFS
    ) public {
        require(bytes(jugadores[_id].nombre).length != 0, "Jugador no registrado");
        jugadores[_id] = Jugador(_nombre, _nickname, _rol, _nacionalidad, _imagenIPFS);
        emit JugadorActualizado(_id, _nombre, _nickname);
    }

    // Eliminar un jugador
    function eliminarJugador(address _id) public {
        require(bytes(jugadores[_id].nombre).length != 0, "Jugador no registrado");
        delete jugadores[_id];
        emit JugadorEliminado(_id);
    }

    // Obtener los datos de un jugador por dirección
    function obtenerJugador(address _id) public view returns (string memory, string memory, string memory, string memory, string memory) {
        require(bytes(jugadores[_id].nombre).length != 0, "Jugador no registrado");
        Jugador memory jugador = jugadores[_id];
        return (jugador.nombre, jugador.nickname, jugador.rol, jugador.nacionalidad, jugador.imagenIPFS);
    }
}
