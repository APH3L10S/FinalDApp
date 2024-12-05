// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Equipos {
    struct Equipo {
        string nombre;
        string logoIPFS; // URL o hash para almacenar el logo del equipo
        address[] jugadores; // Lista de jugadores asociados al equipo
    }

    mapping(uint256 => Equipo) public equipos;
    uint256 public totalEquipos;

    // Eventos
    event EquipoCreado(uint256 equipoId, string nombre, string logoIPFS);
    event JugadorAgregado(uint256 equipoId, address jugador);
    event JugadorEliminado(uint256 equipoId, address jugador);

    // Crear un nuevo equipo
    function crearEquipo(string memory _nombre, string memory _logoIPFS) public {
        equipos[totalEquipos] = Equipo({
            nombre: _nombre,
            logoIPFS: _logoIPFS,
            jugadores: new address[](0)
            });
        emit EquipoCreado(totalEquipos, _nombre, _logoIPFS);
        totalEquipos++;
    }

    // Agregar un jugador a un equipo
    function agregarJugador(uint256 _equipoId, address _jugador) public {
        require(_equipoId < totalEquipos, "Equipo no existe");

        Equipo storage equipo = equipos[_equipoId];
        // Validar que el jugador no esté ya en el equipo
        for (uint256 i = 0; i < equipo.jugadores.length; i++) {
            require(equipo.jugadores[i] != _jugador, "Jugador ya esta en el equipo");
        }
        equipo.jugadores.push(_jugador);
        emit JugadorAgregado(_equipoId, _jugador);
    }

    // Eliminar un jugador de un equipo
    function eliminarJugador(uint256 _equipoId, address _jugador) public {
        require(_equipoId < totalEquipos, "Equipo no existe");

        Equipo storage equipo = equipos[_equipoId];
        bool encontrado = false;
        uint256 index;

        for (uint256 i = 0; i < equipo.jugadores.length; i++) {
            if (equipo.jugadores[i] == _jugador) {
                encontrado = true;
                index = i;
                break;
            }
        }
        require(encontrado, "Jugador no encontrado en el equipo");

        // Reemplazar el jugador a eliminar con el último y reducir el array
        equipo.jugadores[index] = equipo.jugadores[equipo.jugadores.length - 1];
        equipo.jugadores.pop();
        emit JugadorEliminado(_equipoId, _jugador);
    }

    // Obtener detalles de un equipo
    function obtenerEquipo(uint256 _equipoId) public view returns (string memory, string memory, address[] memory) {
        require(_equipoId < totalEquipos, "Equipo no existe");
        Equipo memory equipo = equipos[_equipoId];
        return (equipo.nombre, equipo.logoIPFS, equipo.jugadores);
    }
}
