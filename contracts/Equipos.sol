// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface INFTContract {
    function getNFTDetails(uint256 tokenId) external view returns (uint8 nftType, string memory metadata, address associatedPlayer, uint256 associatedTeam);
    function deleteNFT(uint256 tokenId) external;
}

interface IJugadoresContract {
    function eliminarJugador(address playerAddress) external;
}

contract Equipos {
    struct Equipo {
        uint256 idEquipo;
        string nombre;
        string logoIPFS;
        address[] jugadores;
        uint256 nftId;
        bool existe;
    }

    mapping(uint256 => Equipo) public equipos;
    uint256 public totalEquipos;
    address public nftContractAddress;
    address public jugadoresContractAddress;

    event EquipoCreado(uint256 idEquipo, string nombre, string logoIPFS);
    event EquipoEliminado(uint256 idEquipo);
    event JugadorAgregado(uint256 equipoId, uint256 jugador);

    constructor(address _nftContractAddress, address _jugadoresContractAddress) {
        nftContractAddress = _nftContractAddress;
        jugadoresContractAddress = _jugadoresContractAddress;
    }

    function crearEquipo(uint256 _idEquipo, string memory _nombre, string memory _logoIPFS, uint256 _idNFT) public {
        require(!equipos[_idEquipo].existe, "Este equipo ya existe");
        equipos[_idEquipo] = Equipo({
            idEquipo: _idEquipo,
            nombre: _nombre,
            logoIPFS: _logoIPFS,
            jugadores: new address[](0),
            nftId: _idNFT,
            existe: true
        });
        emit EquipoCreado(_idEquipo, _nombre, _logoIPFS);
        totalEquipos++;
    }

    function agregarJugador(uint256 _equipoId, uint256 _jugadorId) public {
        require(equipos[_equipoId].existe, "Equipo no existe");
        equipos[_equipoId].jugadores.push(address(uint160(_jugadorId))); // Conversión a dirección
        emit JugadorAgregado(_equipoId, _jugadorId);
    }

    function consultarEquipo(uint256 _equipoId) public view returns (uint256, string memory, string memory, address[] memory, uint256) {
        require(equipos[_equipoId].existe, "Equipo no existe");
        Equipo memory equipo = equipos[_equipoId];
        return (equipo.idEquipo, equipo.nombre, equipo.logoIPFS, equipo.jugadores, equipo.nftId);
    }

    function eliminarEquipo(uint256 _equipoId) public {
        require(equipos[_equipoId].existe, "Equipo no existe");

        address[] memory jugadoresEquipo = equipos[_equipoId].jugadores;

        for (uint256 i = 0; i < jugadoresEquipo.length; i++) {
            address jugador = jugadoresEquipo[i];
            IJugadoresContract(jugadoresContractAddress).eliminarJugador(jugador);
        }

        INFTContract(nftContractAddress).deleteNFT(equipos[_equipoId].nftId);

        delete equipos[_equipoId];
        totalEquipos--;
        emit EquipoEliminado(_equipoId);
    }
}
