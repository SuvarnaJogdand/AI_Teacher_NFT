// pragma solidity ^0.8.24;

// import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
// import "@openzeppelin/contracts/access/Ownable.sol";

// contract AITeacherNFT is ERC721URIStorage, Ownable {
//     // ----------------------------------------
//     // STRUCTS
//     // ----------------------------------------

//     struct Teacher {
//         string name;
//         string subject;
//         string topic;
//         string specialization;
//         uint256 mintPrice;
//         bool exists;
//     }

//     // ----------------------------------------
//     // STORAGE
//     // ----------------------------------------

//     uint256 private _nextTokenId;

//     mapping(uint256 => Teacher) private teachers;

//     mapping(uint256 => string[]) private teacherSkills;

//     // ----------------------------------------
//     // EVENTS
//     // ----------------------------------------

//     event TeacherMinted(
//         uint256 indexed tokenId,
//         address indexed teacher,
//         string name,
//         uint256 mintPrice
//     );

//     event SkillAdded(uint256 indexed tokenId, string skill);

//     // ----------------------------------------
//     // CONSTRUCTOR
//     // ----------------------------------------

//     constructor() ERC721("AI Teacher NFT", "AITCHR") {}

//     // ----------------------------------------
//     // MINT
//     // ----------------------------------------

//     function mintTeacher(
//         address to,
//         string memory name,
//         string memory subject,
//         string memory topic,
//         string memory specialization,
//         string memory metadataURI,
//         uint256 mintPrice
//     ) external returns (uint256) {
//         require(bytes(name).length > 0, "Invalid name");
//         require(bytes(subject).length > 0, "Invalid subject");

//         _nextTokenId++;

//         uint256 tokenId = _nextTokenId;

//         _safeMint(to, tokenId);

//         _setTokenURI(tokenId, metadataURI);

//         teachers[tokenId] = Teacher({
//             name: name,
//             subject: subject,
//             topic: topic,
//             specialization: specialization,
//             mintPrice: mintPrice,
//             exists: true
//         });

//         emit TeacherMinted(tokenId, to, name, mintPrice);

//         return tokenId;
//     }

//     // ----------------------------------------
//     // ADD SKILL
//     // ----------------------------------------

//     function addSkill(uint256 tokenId, string memory skill) external {
//         require(ownerOf(tokenId) == msg.sender);

//         teacherSkills[tokenId].push(skill);

//         emit SkillAdded(tokenId, skill);
//     }

//     // ----------------------------------------
//     // GET TEACHER
//     // ----------------------------------------

//     function getTeacher(
//         uint256 tokenId
//     ) external view returns (Teacher memory) {
//         require(teachers[tokenId].exists, "Teacher not found");

//         return teachers[tokenId];
//     }

//     // ----------------------------------------
//     // GET SKILLS
//     // ----------------------------------------

//     function getSkills(
//         uint256 tokenId
//     ) external view returns (string[] memory) {
//         return teacherSkills[tokenId];
//     }

//     // ----------------------------------------
//     // TOTAL SUPPLY
//     // ----------------------------------------

//     function totalSupply() external view returns (uint256) {
//         return _nextTokenId;
//     }

//     function getTotalSupply() public view returns (uint256) {
//         return _nextTokenId;
//     }

//     function teacherOwner(uint256 tokenId) public view returns (address) {
//         return ownerOf(tokenId);
//     }
// }

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "./core/TeacherMint.sol";
import "./core/TeacherStatsManager.sol";

contract AITeacherNFT is
    ERC721URIStorage,
    Ownable,
    TeacherMint,
    TeacherStatsManager
{
    constructor() ERC721("AI Teacher NFT", "AITCHR") Ownable() {}

    // =====================================================
    // TeacherStorage → ERC721
    // =====================================================

    function _safeMintInternal(address to, uint256 tokenId) internal override {
        _safeMint(to, tokenId);
    }

    function _setTokenURIInternal(
        uint256 tokenId,
        string memory uri
    ) internal override {
        _setTokenURI(tokenId, uri);
    }

    function _balanceOfInternal(
        address owner
    ) internal view override returns (uint256) {
        return balanceOf(owner);
    }

    function _checkOwnerInternal() internal view override {
        _checkOwner();
    }

    function _ownerOfInternal(
        uint256 tokenId
    ) internal view override returns (address) {
        return ownerOf(tokenId);
    }

    function _transferInternal(
        address from,
        address to,
        uint256 tokenId
    ) internal override {
        _transfer(from, to, tokenId);
    }

    // =====================================================
    // ERC721 URI STORAGE
    // =====================================================

    function tokenURI(
        uint256 tokenId
    ) public view override(ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function hasAccess(
        uint256 tokenId,
        address user
    ) public view override(TeacherStorage) returns (bool) {
        if (_ownerOfInternal(tokenId) == user) {
            return true;
        }

        return accessExpiry[tokenId][user] > block.timestamp;
    }
}
