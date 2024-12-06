// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

//[05-12-2024]
interface INFTContract {
    function mintReconocimiento(address to, string memory metadata, address player) external;
    function getNFTDetails(uint256 tokenId) external view returns (uint8 nftType, string memory metadata, address associatedPlayer, uint256 associatedTeam);
}

contract Jugadores {
    struct Jugador {
        string nombre;
        string nickname;
        string rol;
        string nacionalidad;
        string imagenIPFS; // URL o hash para almacenar la imagen del jugador
    }

    mapping(address => Jugador) public jugadores;
    mapping(address => uint256[]) public jugadorNFTs; // NFTs asociados a cada jugador [05-12-2024]
    
    address public nftContractAddress; // Dirección del contrato de NFTs [05-12-2024]

    // Eventos
    event JugadorRegistrado(address indexed id, string nombre, string nickname);
    event JugadorActualizado(address indexed id, string nombre, string nickname);
    event JugadorEliminado(address indexed id);
    event NFTAsociado(address indexed jugadorId, uint256 tokenId); //[05-12-2024]

    //[05-12-2024]
    constructor(address _nftContractAddress) {
        nftContractAddress = _nftContractAddress;
    }

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
        delete jugadorNFTs[_id]; // Eliminar NFTs asociados al jugador [05-12-2024]
        emit JugadorEliminado(_id);
    }

    // Asociar un NFT DE RECONOCIMIENTO a un jugador [05-12-2024]
    function asociarNFT(address _id, uint256 tokenId) public {
        require(bytes(jugadores[_id].nombre).length != 0, "Jugador no registrado");

        // Verificar los detalles del NFT desde el contrato de NFTs
        INFTContract nftContract = INFTContract(nftContractAddress);
        (uint8 nftType, , address associatedPlayer, ) = nftContract.getNFTDetails(tokenId);

        require(nftType == 1, "NFT no es un reconocimiento"); // 1 = RECONOCIMIENTO
        require(associatedPlayer == address(0), "NFT ya está asociado a otro jugador");

        //Asociar el NFT al jugador
        jugadorNFTs[_id].push(tokenId);

        emit NFTAsociado(_id, tokenId);
    }

    // Acuñar/minar un NFT de reconocimiento para un jugador [05-12-2024]
    function minarReconocimiento(address _id, string memory metadata) public {
        require(bytes(jugadores[_id].nombre).length != 0, "Jugador no registrado");

        // Llamar al contrato de NFTs para acuñar el reconocimiento
        INFTContract nftContract = INFTContract(nftContractAddress);
        nftContract.mintReconocimiento(_id, metadata, _id);
    }

    // Obtener los NFTs asociados a un jugador [05-12-2024]
    function obtenerNFTsDeJugador(address _id) public view returns (uint256[] memory) {
        return jugadorNFTs[_id];
    }

    // Obtener los datos de un jugador por dirección
    function obtenerJugador(address _id) public view returns (string memory, string memory, string memory, string memory, string memory) {
        require(bytes(jugadores[_id].nombre).length != 0, "Jugador no registrado");
        Jugador memory jugador = jugadores[_id];
        return (jugador.nombre, jugador.nickname, jugador.rol, jugador.nacionalidad, jugador.imagenIPFS);
    }
}
