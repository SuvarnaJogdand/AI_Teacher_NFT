// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "../interfaces/IPaymentManager.sol";

abstract contract TeacherStorage {
    IPaymentManager internal paymentManager;

    modifier onlyPaymentService() {
        require(
            address(paymentManager) != address(0),
            "Payment manager not configured"
        );

        require(paymentManager.authorizedServices(msg.sender), "Unauthorized");

        _;
    }

    // =====================================================
    // STRUCTS
    // =====================================================

    struct TeacherInfo {
        string name;
        string subject;
        string topic;
        string specialization;
    }

    struct TeacherMarket {
        uint256 price; // Native POL price
        bool forSale;
        uint256 rentPricePerDay; // Native POL rent price
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

    // =====================================================
    // STATE VARIABLES
    // =====================================================

    uint256 public totalSupply;
    uint256 internal tokenCounter;

    // =====================================================
    // TEACHER DATA
    // =====================================================

    mapping(uint256 => TeacherInfo) public teacherInfo;
    mapping(uint256 => TeacherMarket) public teacherMarket;
    mapping(uint256 => TeacherStats) public teacherStats;
    mapping(uint256 => TeacherData) public teacherData;

    // =====================================================
    // ACCESS CONTROL
    // =====================================================

    mapping(uint256 => mapping(address => uint256)) public accessExpiry;

    mapping(uint256 => mapping(address => uint256)) public subscriptionExpiry;

    // =====================================================
    // RENTAL
    // =====================================================

    mapping(address => uint256[]) internal userRentals;

    mapping(address => mapping(uint256 => bool)) internal rentalExists;

    // =====================================================
    // SUBSCRIPTIONS
    // =====================================================

    mapping(address => uint256[]) public userSubscriptions;

    mapping(address => mapping(uint256 => bool)) public subscriptionExists;

    // =====================================================
    // SUBSCRIPTION PRICES (Native POL)
    // =====================================================

    mapping(uint256 => uint256) public monthlySubscriptionPrice;

    mapping(uint256 => uint256) public yearlySubscriptionPrice;

    // =====================================================
    // MULTI-CURRENCY PRICES
    // tokenId => tokenAddress => price
    // =====================================================

    // Monthly subscription
    mapping(uint256 => mapping(address => uint256))
        public subscriptionMonthlyPriceByToken;

    // Yearly subscription
    mapping(uint256 => mapping(address => uint256))
        public subscriptionYearlyPriceByToken;

    // NFT Sale Price
    mapping(uint256 => mapping(address => uint256)) public salePriceByToken;

    // Rental Price
    mapping(uint256 => mapping(address => uint256)) public rentPriceByToken;

    // =====================================================
    // RATINGS
    // =====================================================

    mapping(uint256 => mapping(address => bool)) public hasRated;

    // =====================================================
    // SKILLS
    // =====================================================

    mapping(uint256 => string[]) internal skills;

    // =====================================================
    // INTERNAL ERC721 FUNCTIONS
    // Implemented in AITeacherNFT.sol
    // =====================================================

    function _safeMintInternal(address to, uint256 tokenId) internal virtual;

    function _setTokenURIInternal(
        uint256 tokenId,
        string memory uri
    ) internal virtual;

    function _balanceOfInternal(
        address owner
    ) internal view virtual returns (uint256);

    function _checkOwnerInternal() internal view virtual;

    function _ownerOfInternal(
        uint256 tokenId
    ) internal view virtual returns (address);

    function _transferInternal(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual;

    // =====================================================
    // ACCESS CHECK
    // =====================================================

    function hasAccess(
        uint256 tokenId,
        address user
    ) public view virtual returns (bool);
}
