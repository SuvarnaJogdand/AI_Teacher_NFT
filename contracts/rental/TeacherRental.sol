// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "../interfaces/IAITeacherNFT.sol";
import "../interfaces/IPaymentManager.sol";

contract TeacherRental is Ownable {
    IAITeacherNFT public nft;
    IPaymentManager public paymentManager;

    modifier onlyPaymentService() {
        require(
            address(paymentManager) != address(0),
            "Payment manager not configured"
        );

        require(paymentManager.authorizedServices(msg.sender), "Unauthorized");

        _;
    }

    struct RentalInfo {
        uint256 pricePerDay;
        bool available;
    }

    struct UserRental {
        uint256 expiry;
    }

    // tokenId => rental information
    mapping(uint256 => RentalInfo) public rentals;

    // tokenId => user => rental
    mapping(uint256 => mapping(address => UserRental)) public userRentals;

    event NFTListedForRent(uint256 indexed tokenId, uint256 pricePerDay);

    event RentalCancelled(uint256 indexed tokenId);

    event NFTRented(
        uint256 indexed tokenId,
        address indexed renter,
        uint256 expiry
    );

    constructor(address nftAddress) {
        nft = IAITeacherNFT(nftAddress);
    }

    //--------------------------------------------------
    // List NFT for Rent
    //--------------------------------------------------

    function listForRent(uint256 tokenId, uint256 pricePerDay) external {
        require(nft.ownerOf(tokenId) == msg.sender, "Not owner");

        require(pricePerDay > 0, "Invalid price");

        rentals[tokenId] = RentalInfo({
            pricePerDay: pricePerDay,
            available: true
        });

        emit NFTListedForRent(tokenId, pricePerDay);
    }

    //--------------------------------------------------
    // Cancel Rent
    //--------------------------------------------------

    function cancelRent(uint256 tokenId) external {
        require(nft.ownerOf(tokenId) == msg.sender, "Not owner");

        delete rentals[tokenId];

        emit RentalCancelled(tokenId);
    }

    //--------------------------------------------------
    // Rent Teacher
    //--------------------------------------------------

    function rentTeacher(uint256 tokenId, uint256 daysCount) external payable {
        RentalInfo storage rental = rentals[tokenId];

        require(rental.available, "Not available");

        require(daysCount > 0, "Invalid duration");

        uint256 totalPrice = rental.pricePerDay * daysCount;

        require(msg.value == totalPrice, "Incorrect payment");

        address owner = nft.ownerOf(tokenId);

        require(owner != msg.sender, "Cannot rent own NFT");

        (bool success, ) = payable(owner).call{value: msg.value}("");

        require(success, "Payment failed");

        uint256 currentExpiry = userRentals[tokenId][msg.sender].expiry;

        if (currentExpiry < block.timestamp) {
            currentExpiry = block.timestamp;
        }

        uint256 expiry = currentExpiry + (daysCount * 1 days);

        userRentals[tokenId][msg.sender].expiry = expiry;

        emit NFTRented(tokenId, msg.sender, expiry);
    }

    function activateRental(
        bytes32 paymentId,
        uint256 tokenId,
        address renter,
        uint256 daysCount,
        uint256 amount
    ) external onlyPaymentService returns (uint256) {
        RentalInfo storage rental = rentals[tokenId];

        require(rental.available, "NFT not available for rent");

        require(daysCount > 0, "Invalid duration");

        require(
            paymentManager.validatePayment(paymentId, tokenId, renter, amount),
            "Invalid payment"
        );

        uint256 currentExpiry = userRentals[tokenId][renter].expiry;

        if (currentExpiry < block.timestamp) {
            currentExpiry = block.timestamp;
        }

        uint256 expiry = currentExpiry + (daysCount * 1 days);

        userRentals[tokenId][renter].expiry = expiry;

        emit NFTRented(tokenId, renter, expiry);

        return expiry;
    }

    //--------------------------------------------------
    // Check Access
    //--------------------------------------------------

    function hasAccess(
        uint256 tokenId,
        address user
    ) public view returns (bool) {
        if (nft.ownerOf(tokenId) == user) {
            return true;
        }

        return userRentals[tokenId][user].expiry > block.timestamp;
    }


    //--------------------------------------------------
    // Get Expiry
    //--------------------------------------------------

    function getRentalExpiry(
        uint256 tokenId,
        address user
    ) external view returns (uint256) {
        return userRentals[tokenId][user].expiry;
    }

    //--------------------------------------------------
    // Get Rental Info
    //--------------------------------------------------

    function getRental(
        uint256 tokenId
    ) external view returns (RentalInfo memory) {
        return rentals[tokenId];
    }

    function setPaymentManager(address manager) external onlyOwner {
        require(manager != address(0), "Invalid address");

        paymentManager = IPaymentManager(manager);
    }
}
