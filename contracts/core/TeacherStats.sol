// SPDX-License-Identifier: MIT

pragma solidity ^0.8.24;

import "./TeacherStorage.sol";

abstract contract TeacherStatsManager is TeacherStorage {
    // ----------------------------
    // EVENTS
    // ----------------------------

    event ExperienceAdded(uint256 indexed tokenId, uint256 xp);
    event LevelUp(uint256 indexed tokenId, uint256 newLevel);
    event SkillAdded(uint256 indexed tokenId, string skill);
    event TeacherRated(
        uint256 indexed tokenId,
        address indexed user,
        uint256 stars
    );

    // ----------------------------
    // ADD EXPERIENCE
    // ----------------------------
    function addExperience(uint256 tokenId, uint256 xp) public {
        _checkOwnerInternal();

        require(teacherData[tokenId].exists, "Teacher does not exist");

        teacherStats[tokenId].experience += xp;

        uint256 newLevel = (teacherStats[tokenId].experience / 100) + 1;

        if (newLevel > teacherStats[tokenId].level) {
            teacherStats[tokenId].level = newLevel;

            emit LevelUp(tokenId, newLevel);
        }

        emit ExperienceAdded(tokenId, xp);
    }

    // ----------------------------
    // ADD SKILL
    // ----------------------------
    function addSkill(uint256 tokenId, string memory skill) public {
        _checkOwnerInternal();

        require(teacherData[tokenId].exists, "Teacher does not exist");

        skills[tokenId].push(skill);

        emit SkillAdded(tokenId, skill);
    }

    // ----------------------------
    // RATE TEACHER
    // ----------------------------
    function rateTeacher(uint256 tokenId, uint256 stars) public {
        require(teacherData[tokenId].exists, "Teacher not found");

        require(hasAccess(tokenId, msg.sender), "No active subscription");

        require(!hasRated[tokenId][msg.sender], "Already rated");

        require(stars >= 1 && stars <= 5, "Invalid rating");

        teacherStats[tokenId].totalRating += stars;
        teacherStats[tokenId].reviewCount++;

        teacherStats[tokenId].rating =
            (teacherStats[tokenId].totalRating * 100) /
            teacherStats[tokenId].reviewCount;

        hasRated[tokenId][msg.sender] = true;

        emit TeacherRated(tokenId, msg.sender, stars);
    }
}
