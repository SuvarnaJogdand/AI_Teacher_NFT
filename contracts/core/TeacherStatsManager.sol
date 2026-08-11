// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./TeacherStorage.sol";

abstract contract TeacherStatsManager is TeacherStorage {
    function addStudent(uint256 tokenId) internal {
        teacherStats[tokenId].totalStudents++;
    }

    function addSubscriber(uint256 tokenId) internal {
        teacherStats[tokenId].activeSubscribers++;
    }

    function addLesson(uint256 tokenId) internal {
        teacherStats[tokenId].lessonsCompleted++;
    }

    function addQuestion(uint256 tokenId) internal {
        teacherStats[tokenId].questionsAnswered++;
    }

    function addView(uint256 tokenId) internal {
        teacherStats[tokenId].profileViews++;
    }

    function addRevenue(uint256 tokenId, uint256 amount) internal {
        teacherStats[tokenId].totalRevenue += amount;
    }

    function getAverageRating(uint256 tokenId) public view returns (uint256) {
        TeacherStats storage stats = teacherStats[tokenId];

        if (stats.reviewCount == 0) return 0;

        return stats.totalRating / stats.reviewCount;
    }

    function rateTeacher(uint256 tokenId, uint8 rating) public {
        require(rating >= 1 && rating <= 5, "Invalid rating");

        require(!hasRated[tokenId][msg.sender], "Already rated");

        hasRated[tokenId][msg.sender] = true;

        teacherStats[tokenId].totalRating += rating;
        teacherStats[tokenId].reviewCount++;

        teacherStats[tokenId].rating = getAverageRating(tokenId);
    }

    function likeTeacher(uint256 tokenId) public {
        require(!hasLiked[tokenId][msg.sender], "Already liked");

        hasLiked[tokenId][msg.sender] = true;

        teacherStats[tokenId].likes++;
    }
}
