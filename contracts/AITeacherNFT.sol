// SPDX-License-Identifier: MIT

pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

import "./core/TeacherStorage.sol";
import "./core/TeacherMint.sol";
import "./core/TeacherStats.sol";
import "./market/TeacherMarketplace.sol";
import "./rental/TeacherRental.sol";

contract AITeacherNFT is
    ERC721URIStorage,
    Ownable,
    ReentrancyGuard,
    TeacherMint,
    TeacherStatsManager,
    TeacherMarketplace,
    TeacherRental
{
    // ----------------------------
    // CONSTRUCTOR
    // ----------------------------
    constructor() ERC721("AI Teacher NFT", "AITCHR") Ownable() {}

    // ----------------------------
    // BALANCE OF INTERNAL
    // ----------------------------

    function _balanceOfInternal(
        address owner
    ) internal view override returns (uint256) {
        return balanceOf(owner);
    }

    // ----------------------------
    // SAFE MINT INTERNAL
    // ----------------------------
    function _safeMintInternal(address to, uint256 tokenId) internal override {
        _safeMint(to, tokenId);
    }

    // ----------------------------
    // SET TOKEN URI INTERNAL
    // ----------------------------
    function _setTokenURIInternal(
        uint256 tokenId,
        string memory uri
    ) internal override {
        _setTokenURI(tokenId, uri);
    }

    // ----------------------------
    // OWNER OF INTERNAL
    // ----------------------------
    function _ownerOfInternal(
        uint256 tokenId
    ) internal view override returns (address) {
        return ownerOf(tokenId);
    }

    // ----------------------------
    // TRANSFER OF INTERNAL
    // ----------------------------
    function _transferInternal(
        address from,
        address to,
        uint256 tokenId
    ) internal override {
        _transfer(from, to, tokenId);
    }

    // ----------------------------
    // CHECK OWNER INTERNAL
    // ----------------------------

    function _checkOwnerInternal() internal view override {
        _checkOwner();
    }
}
