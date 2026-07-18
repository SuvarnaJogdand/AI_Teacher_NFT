// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "../interfaces/IPaymentManager.sol";

contract PaymentManager is Ownable, IPaymentManager {
    struct PaymentRecord {
        bytes32 paymentId;
        uint256 tokenId;
        address student;
        uint256 amount;
        PaymentType paymentType;
        uint256 timestamp;
        bool processed;
    }

    // paymentId => PaymentRecord
    mapping(bytes32 => PaymentRecord) public payments;

    // Backend services allowed to record payments
    mapping(address => bool) public authorizedServices;

    event AuthorizedServiceAdded(address indexed service);

    event AuthorizedServiceRemoved(address indexed service);

    event PaymentProcessed(
        bytes32 indexed paymentId,
        uint256 indexed tokenId,
        address indexed student,
        uint256 amount,
        PaymentType paymentType,
        uint256 timestamp
    );

    modifier onlyAuthorizedService() {
        require(
            authorizedServices[msg.sender],
            "PaymentManager: Not authorized"
        );
        _;
    }

    constructor() Ownable() {}

    function addAuthorizedService(address service) external onlyOwner {
        require(service != address(0), "Invalid address");

        authorizedServices[service] = true;

        emit AuthorizedServiceAdded(service);
    }

    function removeAuthorizedService(address service) external onlyOwner {
        authorizedServices[service] = false;

        emit AuthorizedServiceRemoved(service);
    }

    function recordPayment(
        bytes32 paymentId,
        uint256 tokenId,
        address student,
        uint256 amount,
        PaymentType paymentType
    ) external override onlyAuthorizedService {
        require(student != address(0), "Invalid student");

        require(!payments[paymentId].processed, "Payment already processed");

        payments[paymentId] = PaymentRecord({
            paymentId: paymentId,
            tokenId: tokenId,
            student: student,
            amount: amount,
            paymentType: paymentType,
            timestamp: block.timestamp,
            processed: true
        });

        emit PaymentProcessed(
            paymentId,
            tokenId,
            student,
            amount,
            paymentType,
            block.timestamp
        );
    }

    function isPaymentProcessed(
        bytes32 paymentId
    ) external view override returns (bool) {
        return payments[paymentId].processed;
    }

    function getPayment(
        bytes32 paymentId
    )
        external
        view
        override
        returns (
            uint256 tokenId,
            address student,
            uint256 amount,
            PaymentType paymentType,
            uint256 timestamp,
            bool processed
        )
    {
        PaymentRecord memory payment = payments[paymentId];

        return (
            payment.tokenId,
            payment.student,
            payment.amount,
            payment.paymentType,
            payment.timestamp,
            payment.processed
        );
    }

    function validatePayment(
        bytes32 paymentId,
        uint256 tokenId,
        address student,
        uint256 amount
    ) external view override returns (bool) {
        PaymentRecord memory payment = payments[paymentId];

        return (payment.processed &&
            payment.tokenId == tokenId &&
            payment.student == student &&
            payment.amount == amount);
    }

    function consumePayment(
        bytes32 paymentId
    ) external override onlyAuthorizedService {
        require(payments[paymentId].processed, "Payment not found");

        delete payments[paymentId];
    }
}
