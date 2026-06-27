// SPDX-License-Identifier: MIT

pragma solidity ^0.8.24;

import "../core/TeacherStorage.sol";

abstract contract TeacherMarketplace is TeacherStorage {
    // ----------------------------
    // EVENTS
    // ----------------------------
    event NFTListed(uint256 indexed tokenId, uint256 price);
    event NFTSaleCancelled(uint256 indexed tokenId);
    event NFTPurchased(
        uint256 indexed tokenId,
        address seller,
        address buyer,
        uint256 price
    );

    // ----------------------------
    // LIST NFT FOR SALE
    // ----------------------------
    function listForSale(uint256 tokenId, uint256 price) public {
        require(_ownerOfInternal(tokenId) == msg.sender, "Not NFT owner");

        require(price > 0, "Invalid price");

        require(!teacherMarket[tokenId].forRent, "Cancel rent first");

        teacherMarket[tokenId].price = price;
        teacherMarket[tokenId].forSale = true;

        emit NFTListed(tokenId, price);
    }

    // ----------------------------
    // CANCEL SALE
    // ----------------------------
    function cancelSale(uint256 tokenId) public {
        require(_ownerOfInternal(tokenId) == msg.sender, "Not NFT owner");

        teacherMarket[tokenId].forSale = false;

        emit NFTSaleCancelled(tokenId);
    }

    // ----------------------------
    // UPDATE PRICE
    // ----------------------------
    function updatePrice(uint256 tokenId, uint256 newPrice) public {
        require(_ownerOfInternal(tokenId) == msg.sender, "Not NFT owner");

        require(newPrice > 0, "Invalid price");

        require(!teacherMarket[tokenId].forSale, "Cancel sale first");

        teacherMarket[tokenId].price = newPrice;
    }

    // ----------------------------
    // BUY NFT
    // ----------------------------
    function buyNFT(uint256 tokenId) public payable {
        TeacherMarket storage market = teacherMarket[tokenId];

        require(teacherData[tokenId].exists, "Teacher not found");

        require(market.forSale, "NFT not for sale");

        address seller = _ownerOfInternal(tokenId);

        require(seller != msg.sender, "Cannot buy your own NFT");

        require(msg.value == market.price, "Incorrect payment amount");

        market.forSale = false;
        market.forRent = false;
        market.rentPricePerDay = 0;

        (bool success, ) = payable(seller).call{value: market.price}("");

        require(success, "Payment failed");

        _transferInternal(seller, msg.sender, tokenId);

        emit NFTPurchased(tokenId, seller, msg.sender, market.price);
    }

    // ----------------------------
    // CHECK SALE STATUS
    // ----------------------------
    function isForSale(uint256 tokenId) public view returns (bool) {
        return teacherMarket[tokenId].forSale;
    }
}
