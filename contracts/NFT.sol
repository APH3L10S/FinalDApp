// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract NFT is ERC721, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;

    // Metadatos asociados a cada NFT
    mapping(uint256 => string) private _tokenMetadata;
    // NFTs por propietario
    mapping(address => uint256[]) private _ownerTokens;

    event NFTMinted(address indexed to, uint256 tokenId, string metadata);
    event MetadataUpdated(uint256 indexed tokenId, string newMetadata);

    constructor() ERC721("ChampionNFT", "NFT") {}

    // Acuñar un NFT
    function mint(address to, string memory metadata) public onlyOwner {
        _tokenIdCounter.increment();
        uint256 tokenId = _tokenIdCounter.current();
        _mint(to, tokenId);

        _tokenMetadata[tokenId] = metadata;
        _ownerTokens[to].push(tokenId);

        emit NFTMinted(to, tokenId, metadata);
    }

    // Obtener metadata de un NFT
    function getMetadata(uint256 tokenId) public view returns (string memory) {
        require(_exists(tokenId), "NFT no existe");
        return _tokenMetadata[tokenId];
    }

    // Actualizar metadata de un NFT
    function updateMetadata(uint256 tokenId, string memory newMetadata) public onlyOwner {
        require(_exists(tokenId), "NFT no existe");
        _tokenMetadata[tokenId] = newMetadata;
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
