// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract NFT is ERC721, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;

    //Tipos de NFTs [05-12-2024]
    enum NFTType { COLECCIONABLE, RECONOCIMIENTO }

    //Estructura de datos de NFT [05-12-2024]
    struct NFTData {
        NFTType nftType; // Tipo de NFT
        string metadata; // Metadatos del NFT
        address associatedPlayer; // Dirección del jugador asociado (si aplica)
        uint256 associatedTeam; // ID del equipo asociado (si aplica)
    }

    // Datos de los NFTs [05-12-2024]
    mapping(uint256 => NFTData) private _nftDetails;
    // CODIGO ORIGINAL: Metadatos asociados a cada NFT
    //mapping(uint256 => string) private _tokenMetadata;
    
    // NFTs por propietario
    mapping(address => uint256[]) private _ownerTokens;

    event NFTMinted(address indexed to, uint256 tokenId, NFTType nftType, string metadata); //[05-12-2024]
    //event NFTMinted(address indexed to, uint256 tokenId, string metadata); //CODIGO ORIGINAL
    event MetadataUpdated(uint256 indexed tokenId, string newMetadata);

    constructor() ERC721("ChampionNFT", "NFT") {}

    // Acuñar/minar un NFT como "coleccionable" asociado a un EQUIPO [05-12-2024]
    function mintColeccionable(address to, string memory metadata, uint256 teamId) public onlyOwner {
        _tokenIdCounter.increment();
        uint256 tokenId = _tokenIdCounter.current();
        _mint(to, tokenId);

        _nftDetails[tokenId] = NFTData({
            nftType: NFTType.COLECCIONABLE,
            metadata: metadata,
            associatedPlayer: address(0), // No aplica para coleccionables
            associatedTeam: teamId
        });

        _ownerTokens[to].push(tokenId);

        emit NFTMinted(to, tokenId, NFTType.COLECCIONABLE, metadata);
    }

    // Acuñar/minar un NFT como "reconocimiento" asociado a un JUGADOR [05-12-2024]
    function mintReconocimiento(address to, string memory metadata, address player) public onlyOwner {
        _tokenIdCounter.increment();
        uint256 tokenId = _tokenIdCounter.current();
        _mint(to, tokenId);

        _nftDetails[tokenId] = NFTData({
            nftType: NFTType.RECONOCIMIENTO,
            metadata: metadata,
            associatedPlayer: player,
            associatedTeam: 0 // No aplica para reconocimientos
        });

        _ownerTokens[to].push(tokenId);

        emit NFTMinted(to, tokenId, NFTType.RECONOCIMIENTO, metadata);
    }

    /*CODIGO ORIGINAL
    // Acuñar un NFT
    function mint(address to, string memory metadata) public onlyOwner {
        _tokenIdCounter.increment();
        uint256 tokenId = _tokenIdCounter.current();
        _mint(to, tokenId);

        _tokenMetadata[tokenId] = metadata;
        _ownerTokens[to].push(tokenId);

        emit NFTMinted(to, tokenId, metadata);
    }*/

    // Obtener los datos completos de un NFT
    function getNFTDetails(uint256 tokenId) public view returns (NFTData memory) {
        require(_exists(tokenId), "NFT no existe");
        return _nftDetails[tokenId];
    }

    /*CODIGO ORIGINAL
    // Obtener metadata de un NFT
    function getMetadata(uint256 tokenId) public view returns (string memory) {
        require(_exists(tokenId), "NFT no existe");
        return _tokenMetadata[tokenId];
    }*/

    // Actualizar metadata de un NFT
    function updateMetadata(uint256 tokenId, string memory newMetadata) public onlyOwner {
        require(_exists(tokenId), "NFT no existe");
        _nftDetails[tokenId].metadata = newMetadata; //[05-12-2024]
        // _tokenMetadata[tokenId] = newMetadata; //CODIGO ORIGINAL
        emit MetadataUpdated(tokenId, newMetadata);
    }

    // Listar NFTs de un propietario
    function getNFTsByOwner(address owner) public view returns (uint256[] memory) {
        return _ownerTokens[owner];
    }

    // Verificar existencia de un token
    function exists(uint256 tokenId) public view returns (bool) {
        return _exists(tokenId);
    }

    // Total de NFTs acuñados
    function totalMinted() public view returns (uint256) {
        return _tokenIdCounter.current();
    }
}
