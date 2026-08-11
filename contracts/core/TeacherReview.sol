// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./TeacherStorage.sol";

abstract contract TeacherReview is TeacherStorage {

    event ReviewSubmitted(
        uint256 indexed tokenId,
        address indexed student,
        uint8 rating,
        string comment
    );

    event TeacherLiked(
        uint256 indexed tokenId,
        address indexed student
    );

    function submitReview(
        uint256 tokenId,
        uint8 rating,
        string calldata comment
    ) external {

        require(
            teacherData[tokenId].exists,
            "Teacher not found"
        );

        require(
            rating >= 1 && rating <= 5,
            "Invalid rating"
        );

        require(
            !hasReviewed[tokenId][msg.sender],
            "Already reviewed"
        );

        hasReviewed[tokenId][msg.sender] = true;

        teacherReviews[tokenId].push(
            Review({
                student: msg.sender,
                rating: rating,
                comment: comment,
                timestamp: block.timestamp
            })
        );

        teacherStats[tokenId].reviewCount++;
        teacherStats[tokenId].totalRating += rating;

        teacherStats[tokenId].rating =
            teacherStats[tokenId].totalRating /
            teacherStats[tokenId].reviewCount;

        emit ReviewSubmitted(
            tokenId,
            msg.sender,
            rating,
            comment
        );
    }

    function likeTeacher(
        uint256 tokenId
    ) external {

        require(
            !hasLiked[tokenId][msg.sender],
            "Already liked"
        );

        hasLiked[tokenId][msg.sender] = true;

        teacherStats[tokenId].likes++;

        emit TeacherLiked(
            tokenId,
            msg.sender
        );
    }

    function getReviews(
    uint256 tokenId
)
external
view
returns(
    Review[] memory
)
{
    return teacherReviews[tokenId];
}

function getAverageRating(
    uint256 tokenId
)
public
view
returns(uint256)
{
    if(
        teacherStats[tokenId].reviewCount == 0
    ){
        return 0;
    }

    return
        teacherStats[tokenId].totalRating /
        teacherStats[tokenId].reviewCount;
}
}