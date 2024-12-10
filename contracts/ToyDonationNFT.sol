// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ToyDonationNFT is ERC721URIStorage {
    uint256 private _tokenIdCounter;

    constructor() ERC721("ToyDonationNFT", "TDN") {
        _tokenIdCounter = 1; // Comienza en 1 para evitar problemas con ID 0
    }

    // Función para mintear un nuevo NFT de donación de juguete
    function mintNFT(address recipient, string memory tokenURI) public returns (uint256) {
        uint256 newItemId = _tokenIdCounter;
        _mint(recipient, newItemId);
        _setTokenURI(newItemId, tokenURI);
        _tokenIdCounter++;
        return newItemId;
    }
}
