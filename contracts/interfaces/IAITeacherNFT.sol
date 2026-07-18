// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IAITeacherNFT {

    function ownerOf(
        uint256 tokenId
    ) external view returns(address);

    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId
    ) external;

}