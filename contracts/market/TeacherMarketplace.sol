// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "../interfaces/IAITeacherNFT.sol";
import "../interfaces/IPaymentManager.sol";

contract TeacherMarketplace is Ownable {
    IAITeacherNFT public nft;
    IPaymentManager public paymentManager;

    struct Listing {
        uint256 price;
        bool active;
    }

    mapping(uint256 => Listing) public listings;

    event NFTListed(uint256 indexed tokenId, uint256 price);

    event ListingCancelled(uint256 indexed tokenId);

    event NFTPurchased(
        uint256 indexed tokenId,
        address indexed seller,
        address indexed buyer,
        uint256 amount
    );

    modifier onlyPaymentService() {
        require(
            address(paymentManager) != address(0),
            "Payment manager not configured"
        );

        require(paymentManager.authorizedServices(msg.sender), "Unauthorized");

        _;
    }

    constructor(address nftAddress) {
        nft = IAITeacherNFT(nftAddress);
    }

    //------------------------------------------------
    // LIST NFT
    //------------------------------------------------

    function listNFT(uint256 tokenId, uint256 price) external {
        require(nft.ownerOf(tokenId) == msg.sender, "Not owner");

        require(price > 0, "Invalid price");

        listings[tokenId] = Listing({price: price, active: true});

        emit NFTListed(tokenId, price);
    }

    //------------------------------------------------
    // CANCEL
    //------------------------------------------------

    function cancelListing(uint256 tokenId) external {
        require(nft.ownerOf(tokenId) == msg.sender, "Not owner");

        delete listings[tokenId];

        emit ListingCancelled(tokenId);
    }

    //------------------------------------------------
    // BUY NFT
    //------------------------------------------------

    function buyNFT(uint256 tokenId) external payable {
        Listing storage listing = listings[tokenId];

        require(listing.active, "NFT not listed");

        address seller = nft.ownerOf(tokenId);

        require(seller != msg.sender, "Cannot buy own NFT");

        require(msg.value == listing.price, "Incorrect payment");

        (bool success, ) = payable(seller).call{value: msg.value}("");

        require(success);

        nft.safeTransferFrom(seller, msg.sender, tokenId);

        delete listings[tokenId];

        emit NFTPurchased(tokenId, seller, msg.sender, msg.value);
    }

    //------------------------------------------------

    function getListing(
        uint256 tokenId
    ) external view returns (Listing memory) {
        return listings[tokenId];
    }

    function completePurchase(
        bytes32 paymentId,
        uint256 tokenId,
        address buyer,
        uint256 amount
    ) external onlyPaymentService {
        Listing storage listing = listings[tokenId];

        require(listing.active, "NFT not listed");

        require(
            paymentManager.validatePayment(paymentId, tokenId, buyer, amount),
            "Invalid payment"
        );

        address seller = nft.ownerOf(tokenId);

        require(seller != buyer, "Already owner");

        nft.safeTransferFrom(seller, buyer, tokenId);

        delete listings[tokenId];

        emit NFTPurchased(tokenId, seller, buyer, amount);
    }

    function setPaymentManager(address manager) external onlyOwner {
        require(manager != address(0), "Invalid address");

        paymentManager = IPaymentManager(manager);
    }
}
