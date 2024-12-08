// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

//[05-12-2024]
interface INFTContract {
    function mintReconocimiento(address to, string memory metadata, address player) external;
    function getNFTDetails(uint256 tokenId) external view returns (uint8 nftType, string memory metadata, address associatedPlayer, uint256 associatedTeam);
    function deleteNFT(uint256 tokenId) external;
}

contract Jugadores {
    struct Jugador {
        uint256 idJugador;
        string nombre;
        string nickname;
        string rol;
        string nacionalidad;
        string imagenIPFS; // URL o hash para almacenar la imagen del jugador
        uint256 equipoId;
        uint256 nftId; //NFT asociado al jugador
    }

    mapping(uint256 => Jugador) public jugadores;
    //mapping(address => Jugador) public jugadores;
    //mapping(address => uint256[]) public jugadorNFTs; // NFTs asociados a cada jugador [05-12-2024]
    
    uint256 public totalJugadores;
    address public nftContractAddress; // Dirección del contrato de NFTs [05-12-2024]

    // Eventos
    event JugadorRegistrado(uint256 idJugador, string nombre, string nickname);
    event JugadorActualizado(uint256 idJugador, string nombre, string nickname);
    event JugadorEliminado(uint256 idJugador);
    //event NFTAsociado(address indexed jugadorId, uint256 tokenId); //[05-12-2024]

    //[05-12-2024]
    constructor(address _nftContractAddress) {
        nftContractAddress = _nftContractAddress;
    }

    // Registrar un jugador
    function registrarJugador(
        uint256 _idJugador,
        string memory _nombre,
        string memory _nickname,
        string memory _rol,
        string memory _nacionalidad,
        string memory _imagenIPFS,
        uint256 _equipoId,
        uint256 _nftId
    ) public {
        require(jugadores[_idJugador].idJugador == 0, "Jugador ya registrado");
        //require(bytes(jugadores[_id].nombre).length == 0, "Jugador ya registrado");
        jugadores[_idJugador] = Jugador({
            idJugador: _idJugador,
            nombre: _nombre,
            nickname: _nickname,
            rol: _rol,
            nacionalidad: _nacionalidad,
            imagenIPFS: _imagenIPFS,
            equipoId: _equipoId,
            nftId: _nftId
        });
        //jugadores[_idJugador] = Jugador(_idJugador, _nombre, _nickname, _rol, _nacionalidad, _imagenIPFS);
        emit JugadorRegistrado(_idJugador, _nombre, _nickname);
        totalJugadores++;
    }

    // Actualizar datos de un jugador
    function actualizarJugador(
        uint256 _idJugador,
        string memory _nombre,
        string memory _nickname,
        string memory _rol,
        string memory _nacionalidad,
        string memory _imagenIPFS,
        uint256 _equipoId,
        uint256 _nftId
    ) public {
        require(bytes(jugadores[_idJugador].nombre).length != 0, "Jugador no registrado");
        jugadores[_idJugador] = Jugador({
            idJugador: _idJugador,
            nombre: _nombre,
            nickname: _nickname,
            rol: _rol,
            nacionalidad: _nacionalidad,
            imagenIPFS: _imagenIPFS,
            equipoId: _equipoId,
            nftId: _nftId
        });
        emit JugadorActualizado(_idJugador, _nombre, _nickname);
    }

    // Obtener los datos de un jugador por dirección
    function consultarJugador(uint256 _idJugador) public view returns (uint256, string memory, string memory, string memory, string memory, string memory, uint256, uint256) {
        require(jugadores[_idJugador].idJugador != 0, "Jugador no registrado");
        Jugador memory jugador = jugadores[_idJugador];
        
        return (jugador.idJugador, jugador.nombre, jugador.nickname, jugador.rol, jugador.nacionalidad, jugador.imagenIPFS, jugador.equipoId, jugador.nftId);
    }

    // Eliminar un jugador
    function eliminarJugador(uint256 _idJugador) public {
        require(jugadores[_idJugador].idJugador != 0, "Jugador no registrado");
        //require(bytes(jugadores[_id].nombre).length != 0, "Jugador no registrado");
        //ELIMINAR DATOS ASOCIADOS AL JUGADOR
        delete jugadores[_idJugador];
        emit JugadorEliminado(_idJugador);
    }

    // Asociar un NFT DE RECONOCIMIENTO a un jugador [05-12-2024]
    /*function asociarNFT(address _id, uint256 tokenId) public {
        require(bytes(jugadores[_id].nombre).length != 0, "Jugador no registrado");

        // Verificar los detalles del NFT desde el contrato de NFTs
        INFTContract nftContract = INFTContract(nftContractAddress);
        (uint8 nftType, , address associatedPlayer, ) = nftContract.getNFTDetails(tokenId);

        require(nftType == 1, "NFT no es un reconocimiento"); // 1 = RECONOCIMIENTO
        require(associatedPlayer == address(0), "NFT ya esta asociado a otro jugador");

        //Asociar el NFT al jugador
        jugadorNFTs[_id].push(tokenId);

        emit NFTAsociado(_id, tokenId);
    }*/

    // Acuñar/minar un NFT de reconocimiento para un jugador [05-12-2024]
    /*function minarReconocimiento(address _id, string memory metadata) public {
        require(bytes(jugadores[_id].nombre).length != 0, "Jugador no registrado");

        // Llamar al contrato de NFTs para acuñar el reconocimiento
        INFTContract nftContract = INFTContract(nftContractAddress);
        nftContract.mintReconocimiento(_id, metadata, _id);
    }*/

    // Obtener los NFTs asociados a un jugador [05-12-2024]
    /*function obtenerNFTsDeJugador(address _id) public view returns (uint256[] memory) {
        return jugadorNFTs[_id];
    }*/
}