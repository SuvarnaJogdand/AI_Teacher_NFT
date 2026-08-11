// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "../interfaces/IAITeacherNFT.sol";
import "../interfaces/IPaymentManager.sol";

contract TeacherSubscription is Ownable {
    IAITeacherNFT public nft;
    IPaymentManager public paymentManager;

   

    struct SubscriptionPlan {
        uint256 monthlyPrice;
        uint256 yearlyPrice;
        bool enabled;
    }

    struct UserSubscription {
        uint256 expiry;
    }

    // tokenId => subscription plan
    mapping(uint256 => SubscriptionPlan) public plans;

    // tokenId => student => subscription
    mapping(uint256 => mapping(address => UserSubscription))
        public subscriptions;

    event SubscriptionPriceUpdated(
        uint256 indexed tokenId,
        uint256 monthlyPrice,
        uint256 yearlyPrice
    );

    event SubscriptionPurchased(
        uint256 indexed tokenId,
        address indexed student,
        uint256 expiry
    );

    constructor(
        address nftAddress,
        address paymentManagerAddress
    ) {
        nft = IAITeacherNFT(nftAddress);

        paymentManager = IPaymentManager(paymentManagerAddress);
    }

    //------------------------------------------------
    // Teacher sets prices
    //------------------------------------------------

    function setSubscriptionPrice(
        uint256 tokenId,
        uint256 monthly,
        uint256 yearly
    ) external {
        require(nft.ownerOf(tokenId) == msg.sender, "Not owner");

        require(monthly > 0 || yearly > 0, "Invalid prices");

        plans[tokenId] = SubscriptionPlan({
            monthlyPrice: monthly,
            yearlyPrice: yearly,
            enabled: true
        });

        emit SubscriptionPriceUpdated(tokenId, monthly, yearly);
    }

    //------------------------------------------------
    // Crypto subscription
    //------------------------------------------------

    function subscribe(uint256 tokenId, bool yearly) external payable {
        SubscriptionPlan storage plan = plans[tokenId];

        require(plan.enabled, "Subscription unavailable");

        uint256 price = yearly ? plan.yearlyPrice : plan.monthlyPrice;

        require(msg.value == price, "Incorrect payment");

        address owner = nft.ownerOf(tokenId);

        require(owner != msg.sender, "Cannot subscribe own NFT");

        (bool success, ) = payable(owner).call{value: msg.value}("");

        require(success);

        uint256 duration = yearly ? 365 days : 30 days;

        _activateSubscription(tokenId, msg.sender, duration);
    }

    //------------------------------------------------
    // Fiat subscription
    //------------------------------------------------

    function activateSubscription(
        bytes32 paymentId,
        uint256 tokenId,
        address student,
        uint256 duration,
        uint256 amount
    ) external {
        require(paymentManager.authorizedServices(msg.sender), "Unauthorized");

        require(
            paymentManager.validatePayment(paymentId, tokenId, student,amount),
            "Invalid payment"
        );

        _activateSubscription(tokenId, student, duration);
    }

    //------------------------------------------------
    // Internal
    //------------------------------------------------

    function _activateSubscription(
        uint256 tokenId,
        address student,
        uint256 duration
    ) internal {
        uint256 expiry = subscriptions[tokenId][student].expiry;

        if (expiry < block.timestamp) {
            expiry = block.timestamp;
        }

        expiry += duration;

        subscriptions[tokenId][student].expiry = expiry;

        emit SubscriptionPurchased(tokenId, student, expiry);
    }

    //------------------------------------------------
    // View functions
    //------------------------------------------------

    function hasSubscription(
        uint256 tokenId,
        address student
    ) public view returns (bool) {
        if (nft.ownerOf(tokenId) == student) {
            return true;
        }

        return subscriptions[tokenId][student].expiry > block.timestamp;
    }

    function getExpiry(
        uint256 tokenId,
        address student
    ) external view returns (uint256) {
        return subscriptions[tokenId][student].expiry;
    }

    function getPlan(
        uint256 tokenId
    ) external view returns (SubscriptionPlan memory) {
        return plans[tokenId];
    }
}
