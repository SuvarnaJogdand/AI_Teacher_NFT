// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IPaymentManager {
    enum PaymentType {
        POL,
        USDC,
        USDT,
        DAI,
        FIAT
    }

    // -------------------------------------------------
    // AUTHORIZED SERVICES
    // -------------------------------------------------

    function authorizedServices(address service) external view returns (bool);

    // -------------------------------------------------
    // PAYMENT STATUS
    // -------------------------------------------------

    function isPaymentProcessed(bytes32 paymentId) external view returns (bool);

    // -------------------------------------------------
    // GET PAYMENT DETAILS
    // -------------------------------------------------

    function getPayment(
        bytes32 paymentId
    )
        external
        view
        returns (
            uint256 tokenId,
            address student,
            uint256 amount,
            PaymentType paymentType,
            uint256 timestamp,
            bool processed
        );

    // -------------------------------------------------
    // RECORD PAYMENT
    // -------------------------------------------------

    function recordPayment(
        bytes32 paymentId,
        uint256 tokenId,
        address student,
        uint256 amount,
        PaymentType paymentType
    ) external;

    function validatePayment(
        bytes32 paymentId,
        uint256 tokenId,
        address student,
        uint256 amount
    ) external view returns (bool);

    function consumePayment(bytes32 paymentId) external;
}
