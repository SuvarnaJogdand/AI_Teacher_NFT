// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "../core/TeacherStorage.sol";

abstract contract TeacherRental is TeacherStorage {
    // ----------------------------
    // EVENTS
    // ----------------------------
    event NFTRented(
        uint256 indexed tokenId,
        address indexed renter,
        uint256 expiry
    );
    event NFTListedForRent(uint256 indexed tokenId, uint256 pricePerDay);
    event NFTRentCancelled(uint256 indexed tokenId);
    event SubscriptionPurchased(
        uint256 indexed tokenId,
        address indexed user,
        uint256 expiryTime
    );
    event SubscriptionPriceUpdated(
        uint256 indexed tokenId,
        uint256 monthlyPrice,
        uint256 yearlyPrice
    );

    // ----------------------------
    // LIST NFT FOR RENT
    // ----------------------------

    function listForRent(uint256 tokenId, uint256 pricePerDay) public {
        require(_ownerOfInternal(tokenId) == msg.sender, "Not owner");

        require(pricePerDay > 0, "Invalid price");

        require(!teacherMarket[tokenId].forSale, "Cancel sale first");

        TeacherMarket storage market = teacherMarket[tokenId];

        market.rentPricePerDay = pricePerDay;
        market.forRent = true;
        market.forSale = false;

        emit NFTListedForRent(tokenId, pricePerDay);
    }

    // ----------------------------
    // CANCEL RENT
    // ----------------------------
    function cancelRent(uint256 tokenId) public {
        require(_ownerOfInternal(tokenId) == msg.sender, "Not owner");

        teacherMarket[tokenId].forRent = false;
        teacherMarket[tokenId].rentPricePerDay = 0;

        emit NFTRentCancelled(tokenId);
    }

    // ----------------------------
    // RENT NFT
    // ----------------------------

    function rentTeacher(uint256 tokenId, uint256 daysCount) public payable {
        _rentTeacher(tokenId, daysCount);
    }

    // ----------------------------
    // EXTEND RENT
    // ----------------------------

    function _extendRental(
        uint256 tokenId,
        address user,
        uint256 daysCount
    ) internal returns (uint256) {
        uint256 currentExpiry = accessExpiry[tokenId][user];

        if (currentExpiry < block.timestamp) {
            currentExpiry = block.timestamp;
        }

        uint256 expiry = currentExpiry + (daysCount * 1 days);

        accessExpiry[tokenId][user] = expiry;

        return expiry;
    }

    // ----------------------------
    // CURRENT RENTER
    // ----------------------------

    function getAccessExpiry(
        uint256 tokenId,
        address user
    ) public view returns (uint256) {
        return accessExpiry[tokenId][user];
    }

    // ----------------------------
    // ACCESS CHECKING
    // ----------------------------

    function hasAccess(
        uint256 tokenId,
        address user
    ) public view override returns (bool) {
        if (user == _ownerOfInternal(tokenId)) {
            return true;
        }

        if (accessExpiry[tokenId][user] > block.timestamp) {
            return true;
        }

        return false;
    }

    // ----------------------------
    // GET RENTED TOKENS
    // ----------------------------
    function getRentedTokens(
        address user
    ) public view returns (uint256[] memory) {
        return userRentals[user];
    }

    // ----------------------------
    // CHECK FOR RENT
    // ----------------------------
    function isForRent(uint256 tokenId) public view returns (bool) {
        return teacherMarket[tokenId].forRent;
    }

    // ----------------------------
    // CHECK RENT ACTIVE
    // ----------------------------
    function isRentalActive(
        uint256 tokenId,
        address user
    ) public view returns (bool) {
        return accessExpiry[tokenId][user] > block.timestamp;
    }

    // ----------------------------
    // RENT TEACHER
    // ----------------------------

    function _rentTeacher(
        uint256 tokenId,
        uint256 daysCount
    ) internal returns (uint256) {
        TeacherMarket storage market = teacherMarket[tokenId];
        TeacherStats storage stats = teacherStats[tokenId];

        require(teacherData[tokenId].exists, "Teacher not found");
        require(
            msg.sender != _ownerOfInternal(tokenId),
            "Owner cannot rent own NFT"
        );
        require(market.forRent, "Not for rent");
        require(!market.forSale, "NFT listed for sale");
        require(daysCount > 0, "Invalid duration");

        uint256 totalRent = market.rentPricePerDay * daysCount;

        require(msg.value == totalRent, "Incorrect payment amount");

        address owner = _ownerOfInternal(tokenId);

        (bool success, ) = payable(owner).call{value: totalRent}("");

        require(success, "Payment failed");

        if (!rentalExists[msg.sender][tokenId]) {
            userRentals[msg.sender].push(tokenId);
            rentalExists[msg.sender][tokenId] = true;
            stats.totalStudents++;
        }

        uint256 expiry = _extendRental(tokenId, msg.sender, daysCount);

        stats.totalRevenue += totalRent;

        emit NFTRented(tokenId, msg.sender, expiry);

        return expiry;
    }

    // ----------------------------
    // SUBSCRIBE MONTHLY
    // ----------------------------

    function subscribeMonthly(uint256 tokenId) public payable {
        _rentTeacher(tokenId, 30);
    }

    // ----------------------------
    // SUBSCRIBE QUARTERLY
    // ----------------------------

    function subscribeQuarterly(uint256 tokenId) public payable {
        _rentTeacher(tokenId, 90);
    }

    // ----------------------------
    // SUBSCRIBE YEARLY
    // ----------------------------

    function subscribeYearly(uint256 tokenId) public payable {
        _rentTeacher(tokenId, 365);
    }

    // ----------------------------
    // TEACHER SETS SUBSCRIPTION PRICES
    // ----------------------------

    function setSubscriptionPrice(
        uint256 tokenId,
        uint256 monthlyPrice,
        uint256 yearlyPrice
    ) external {
        require(_ownerOfInternal(tokenId) == msg.sender, "Not NFT owner");

        require(monthlyPrice > 0 || yearlyPrice > 0, "Invalid prices");

        monthlySubscriptionPrice[tokenId] = monthlyPrice;
        yearlySubscriptionPrice[tokenId] = yearlyPrice;

        emit SubscriptionPriceUpdated(tokenId, monthlyPrice, yearlyPrice);
    }

    // ----------------------------
    // STUDENT SUBSCRIBES
    // ----------------------------

    function subscribeTeacher(uint256 tokenId, bool yearly) external payable {
        require(
            msg.sender != _ownerOfInternal(tokenId),
            "Owner cannot subscribe"
        );

        require(teacherData[tokenId].exists, "Teacher not found");

        uint256 price = yearly
            ? yearlySubscriptionPrice[tokenId]
            : monthlySubscriptionPrice[tokenId];

        require(price > 0, "Subscription unavailable");

        require(msg.value == price, "Incorrect payment amount");

        address payable teacherOwner = payable(_ownerOfInternal(tokenId));

        uint256 duration = yearly ? 365 days : 30 days;

        uint256 currentExpiry = subscriptionExpiry[tokenId][msg.sender];

        if (currentExpiry < block.timestamp) {
            currentExpiry = block.timestamp;
        }

        subscriptionExpiry[tokenId][msg.sender] = currentExpiry + duration;

        (bool success, ) = teacherOwner.call{value: msg.value}("");

        require(success, "Payment failed");

        accessExpiry[tokenId][msg.sender] = subscriptionExpiry[tokenId][
            msg.sender
        ];

        // Add subscription only once
        if (!subscriptionExists[msg.sender][tokenId]) {
            userSubscriptions[msg.sender].push(tokenId);
            subscriptionExists[msg.sender][tokenId] = true;
        }

        emit SubscriptionPurchased(
            tokenId,
            msg.sender,
            subscriptionExpiry[tokenId][msg.sender]
        );
    }

    // ----------------------------
    // CHECK SUBSCRIPTION
    // ----------------------------

    function hasSubscription(
        uint256 tokenId,
        address user
    ) public view returns (bool) {
        return subscriptionExpiry[tokenId][user] > block.timestamp;
    }

    // ----------------------------
    // GET USER SUBSCRIPTIONS
    // ----------------------------

    function getUserSubscriptions(
        address user
    ) external view returns (uint256[] memory) {
        return userSubscriptions[user];
    }

    // ----------------------------
    // GET SUBSCRIPTION EXPIRY
    // ----------------------------
    function getSubscriptionExpiry(
        uint256 tokenId,
        address user
    ) external view returns (uint256) {
        return subscriptionExpiry[tokenId][user];
    }
}
