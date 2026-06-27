// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./TeacherStorage.sol";
//import "../AITeacherNFT.sol";

abstract contract TeacherMint is TeacherStorage {
    event TeacherMinted(uint256 indexed tokenId, string name);

    // ----------------------------
    // MINT AI TEACHER NFT
    // ----------------------------
    function mintTeacher(
        address to,
        string memory name,
        string memory subject,
        string memory topic,
        string memory specialization,
        string memory metadataURI,
        uint256 price
    ) public returns (uint256) {
        require(bytes(name).length > 0, "Name required");
        require(bytes(subject).length > 0, "Subject required");
        require(bytes(topic).length > 0, "Topic required");
        require(bytes(specialization).length > 0, "Specialization required");
        require(bytes(metadataURI).length > 0, "Metadata URI required");

        uint256 tokenId = tokenCounter;

        _safeMintInternal(to, tokenId);
        _setTokenURIInternal(tokenId, metadataURI);

        // Teacher Info
        teacherInfo[tokenId] = TeacherInfo({
            name: name,
            subject: subject,
            topic: topic,
            specialization: specialization
        });

        // Teacher Market
        teacherMarket[tokenId] = TeacherMarket({
            price: price,
            forSale: false,
            rentPricePerDay: 0,
            forRent: false
        });

        // Teacher Stats
        teacherStats[tokenId] = TeacherStats({
            experience: 0,
            level: 1,
            rating: 0,
            totalStudents: 0,
            totalRevenue: 0,
            totalRating: 0,
            reviewCount: 0
        });

        // Teacher Data
        teacherData[tokenId] = TeacherData({tokenId: tokenId, exists: true});

        totalSupply++;
        tokenCounter++;

        emit TeacherMinted(tokenId, name);
        return tokenId;
    }

    // getTeacher()
    function getTeacher(
        uint256 tokenId
    )
        public
        view
        returns (TeacherInfo memory, TeacherMarket memory, TeacherStats memory)
    {
        return (
            teacherInfo[tokenId],
            teacherMarket[tokenId],
            teacherStats[tokenId]
        );
    }

    // ----------------------------
    // GET SKILLS
    // ----------------------------
    function getSkills(uint256 tokenId) public view returns (string[] memory) {
        return skills[tokenId];
    }

    // ----------------------------
    // TOTAL SUPPLY
    // ----------------------------
    function getTotalSupply() public view returns (uint256) {
        return totalSupply;
    }

    // ----------------------------
    // CURRENT TOKEN ID
    // ----------------------------
    function currentTokenId() public view returns (uint256) {
        return tokenCounter;
    }

    // ----------------------------
    // GET NFT OWNER
    // ----------------------------
    function teacherOwner(uint256 tokenId) public view returns (address) {
        return _ownerOfInternal(tokenId);
    }

    // ----------------------------
    // TOKENS OF OWNER
    // ----------------------------

    function tokensOfOwner(
        address owner
    ) public view returns (uint256[] memory) {
        uint256 count = _balanceOfInternal(owner);

        uint256[] memory ids = new uint256[](count);

        uint256 index = 0;

        for (uint256 i = 0; i < tokenCounter; i++) {
            if (_ownerOfInternal(i) == owner) {
                ids[index] = i;
                index++;
            }
        }

        return ids;
    }
}
