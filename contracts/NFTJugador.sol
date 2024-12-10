// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract NFTJugador is ERC721URIStorage {

    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    struct Jugador {
        string nombre;
        string nickname;
        string rol;
        string nacionalidad;
        string imagen;
    }

    mapping(uint256 => Jugador) public jugadores;

    constructor() ERC721("NFTJugador", "NFTJ") {}

    // Función para crear un NFT para un jugador
    function crearNFT(address _equipo, string memory _nombre, string memory _nickname, string memory _rol, string memory _nacionalidad, string memory _imagen) public returns (uint256) {
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();

        _mint(_equipo, newItemId);
        _setTokenURI(newItemId, _imagen);

        jugadores[newItemId] = Jugador(_nombre, _nickname, _rol, _nacionalidad, _imagen);
        return newItemId;
    }

    // Función para consultar los detalles de un NFT
    function consultarNFT(uint256 tokenId) public view returns (string memory, string memory, string memory, string memory, string memory) {
        require(_exists(tokenId), "NFT no existe");
        Jugador memory jugador = jugadores[tokenId];
        return (jugador.nombre, jugador.nickname, jugador.rol, jugador.nacionalidad, jugador.imagen);
    }

    // Función para transferir un NFT
    function transferirNFT(address _to, uint256 tokenId) public {
        safeTransferFrom(msg.sender, _to, tokenId);
    }
}
