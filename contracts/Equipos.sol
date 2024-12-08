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
        string logoIPFS; // URL o hash para almacenar el logo del equipo
        address[] jugadores; // Lista de jugadores asociados al equipo
        uint256 nftId; //NFT asociado al equipo
        bool existe; //Indica si el equipo existe
        //uint256[] coleccionables; // IDs de NFTs asociados al equipo [05-12-2024]
    }

    mapping(uint256 => Equipo) public equipos;
    uint256 public totalEquipos;
    address public nftContractAddress; // Dirección del contrato de NFTs [05-12-2024]
    address public jugadoresContractAddress; // Dirección del contrato de jugadores [08-12-2024]

    // Eventos
    event EquipoCreado(uint256 idEquipo, string nombre, string logoIPFS);
    event EquipoEliminado(uint256 idEquipo);
    event JugadorAgregado(uint256 equipoId, uint256 jugador);
    //event JugadorAgregado(uint256 equipoId, address jugador);
    
    //event JugadorEliminado(uint256 equipoId, address jugador);
    //event ColeccionableAsociado(uint256 equipoId, uint256 tokenId); //[05-12-2024]

    //[05-12-2024]
    constructor(address _nftContractAddress, address _jugadoresContractAddress) {
        nftContractAddress = _nftContractAddress;
        jugadoresContractAddress = _jugadoresContractAddress;
    }

    // Crear un nuevo equipo
    function crearEquipo(uint256 _idEquipo, string memory _nombre, string memory _logoIPFS, uint256 _idNFT) public {
        require(!equipos[_idEquipo].existe, "Este equipo ya existe/fue registrado");
        equipos[_idEquipo] = Equipo({
            idEquipo: _idEquipo,
            nombre: _nombre,
            logoIPFS: _logoIPFS,
            jugadores: new address[](0),
<<<<<<< HEAD
            nftId: _idNFT,
            existe: true
            //coleccionables: new uint256[](0) //[05-12-2024] - POSIBLE ERROR
=======
            coleccionables: new uint256[](0) //[05-12-2024] - POSIBLE ERROR
>>>>>>> b5a6e703a2aac5733ad510b04ac45d76328f118a
            });
        emit EquipoCreado(_idEquipo, _nombre, _logoIPFS);
        totalEquipos++;
    }

    // Agregar/asociar un jugador a un equipo
    function agregarJugador(uint256 _equipoId, uint256 _jugadorId) public {
    //function agregarJugador(uint256 _equipoId, address _jugador) public {
        require(equipos[_equipoId].idEquipo != 0, "Equipo no existe");
        /*require(_equipoId < totalEquipos, "Equipo no existe");
        Equipo storage equipo = equipos[_equipoId];
        // Validar que el jugador no esté ya en el equipo
        for (uint256 i = 0; i < equipo.jugadores.length; i++) {
            require(equipo.jugadores[i] != _jugador, "Jugador ya esta en el equipo");
        }*/
        equipos[_equipoId].jugadores.push(_jugadorId);
        //equipo.jugadores.push(_jugador);
        emit JugadorAgregado(_equipoId, _jugadorId);
    }

    // Asociar un coleccionable (NFT) a un equipo [05-12-2024]
    /*function asociarColeccionable(uint256 _equipoId, uint256 _tokenId) public {
        require(_equipoId < totalEquipos, "Equipo no existe");

        // Obtener los detalles del NFT desde el contrato de NFTs
        INFTContract nftContract = INFTContract(nftContractAddress);
        //POSIBLE ERROR
        (uint8 nftType, , , uint256 associatedTeam) = nftContract.getNFTDetails(_tokenId);

        require(nftType == 0, "NFT no es un coleccionable"); // Verificar que sea del tipo "COLECCIONABLE"
        require(associatedTeam == 0, "NFT ya asociado a otro equipo"); // Asegurar que el NFT no esté asociado a otro equipo

        // Asociar el NFT al equipo
        Equipo storage equipo = equipos[_equipoId];
        equipo.coleccionables.push(_tokenId);

        emit ColeccionableAsociado(_equipoId, _tokenId);
    }*/

    // Obtener detalles de un equipo
    function consultarEquipo(uint256 _equipoId) public view returns (uint256, string memory, string memory, address[] memory, uint256) {
        require(equipos[_equipoId].existe, "Equipo no existe");
        //require(_equipoId < totalEquipos, "Equipo no existe");
        Equipo memory equipo = equipos[_equipoId];
        return (equipo.idEquipo, equipo.nombre, equipo.logoIPFS, equipo.jugadores, equipo.nftId); //[05-12-2024]
    }

    // Eliminar EQUIPO
    function eliminarEquipo(uint256 _equipoId) public {
        require(equipos[_equipoId].idEquipo != 0, "Equipo no existe");

        //Obtener el equipo
        address[] memory jugadoresEquipo = equipos[_equipoId].jugadores;

        //Eliminar jugadores asociados
        for(uint256 i = 0; i < jugadoresEquipo.length; i++) {
            address jugador = jugadoresEquipo[i];
            IJugadoresContract(jugadoresContractAddress).eliminarJugador(jugador);
        }

        // Eliminar NFT asociado
        INFTContract(nftContractAddress).deleteNFT(equipos[_equipoId].nftId);

        // Eliminar el equipo
        delete equipos[_equipoId];
        totalEquipos--;
        emit EquipoEliminado(_equipoId);
    }

    // Eliminar un jugador de un equipo
    /*function eliminarJugador(uint256 _equipoId, address _jugador) public {
        require(equipos[_equipoId].idEquipo != 0, "Equipo no existe");
        //require(_equipoId < totalEquipos, "Equipo no existe");

        bool encontrado = false;
        uint256 index;

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
    }*/
}