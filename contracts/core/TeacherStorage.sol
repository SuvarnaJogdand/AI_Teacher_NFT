// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

abstract contract TeacherStorage {
    // ----------------------------
    // STRUCTS
    // ----------------------------
    struct TeacherInfo {
        string name;
        string subject;
        string topic;
        string specialization;
    }

    struct TeacherMarket {
        uint256 price;
        bool forSale;
        uint256 rentPricePerDay;
        bool forRent;
    }

    struct TeacherStats {
        uint256 experience;
        uint256 level;
        uint256 rating;
        uint256 totalStudents;
        uint256 totalRevenue;
        uint256 totalRating;
        uint256 reviewCount;
    }

    struct TeacherData {
        uint256 tokenId;
        bool exists;
    }

    uint256 public totalSupply;
    uint256 internal tokenCounter;

    // ----------------------------
    // MAPPINGS
    // ----------------------------

    mapping(uint256 => TeacherInfo) public teacherInfo;
    mapping(uint256 => TeacherMarket) public teacherMarket;
    mapping(uint256 => TeacherStats) public teacherStats;
    mapping(uint256 => TeacherData) public teacherData;
    mapping(uint256 => mapping(address => uint256)) public accessExpiry;
    mapping(address => uint256[]) internal userRentals;
    mapping(address => mapping(uint256 => bool)) internal rentalExists;
    mapping(uint256 => string[]) internal skills;
    mapping(uint256 => mapping(address => bool)) public hasRated;
    mapping(uint256 => mapping(address => uint256)) public subscriptionExpiry;
    mapping(uint256 => uint256) public monthlySubscriptionPrice;
    mapping(uint256 => uint256) public yearlySubscriptionPrice;
    mapping(address => uint256[]) public userSubscriptions;
    mapping(address => mapping(uint256 => bool)) public subscriptionExists;

    

    // ERC721 functions implemented in AITeacherNFT.sol

    // ----------------------------
    // EVENTS
    // ----------------------------

    function _safeMintInternal(address to, uint256 tokenId) internal virtual;

    // ----------------------------
    // SET TOKEN URI INTERNAL
    // ----------------------------
    function _setTokenURIInternal(
        uint256 tokenId,
        string memory uri
    ) internal virtual;

    // ----------------------------
    // BALANCE OF INTERNAL
    // ----------------------------
    function _balanceOfInternal(
        address owner
    ) internal view virtual returns (uint256);

    // ----------------------------
    // CHECK OWNER INTERNAL
    // ----------------------------
    function _checkOwnerInternal() internal view virtual;

    // ----------------------------
    // OWNER OF INTERNAL
    // ----------------------------
    function _ownerOfInternal(
        uint256 tokenId
    ) internal view virtual returns (address);

    // ----------------------------
    // TRANSFER INTERNAL
    // ----------------------------
    function _transferInternal(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual;

    // ----------------------------
    // HAS ACCESS
    // ----------------------------
    function hasAccess(
        uint256 tokenId,
        address user
    ) public view virtual returns (bool);
}
