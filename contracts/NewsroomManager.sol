// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.3;
import "./UserManager.sol";

contract NewsroomManager {

    uint constant NULL = 0;
    int constant repLimit = 10;
    uint currentNews = 0;
    uint currentFlag = 0;

    UserManager public userManager;

    struct Publication {
        string title;
        int rep;
        string contentHash;
        address publisher;
        address[] authors;
        uint prevVersion;
        uint nextVersion;
        uint[] flags;
        address[] upvoter;
        address[] downvoter;
        address flagger;
    }

    struct Flag {
        uint newsID;
        string subject;
        address flagger;
        string contentHash;
        uint status;
        // ENUM status
        // 0 - Pending
        // 1 - Accepted
        // 2 - Rejected
        // 3 - Ignored
        uint expirySeconds;
        address counterFlagger;
        string counterflagWriteup;
        int counterflagRep;
        address[] counterflagUpvoter;
        address[] counterflagDownvoter;
    }

    event NewsPublished (
        uint indexed newsID,
        string title,
        address publisher,
        address[] authors,
        string contentHash,
        string message
    );

    event NewsRevised (
        uint indexed newsID,
        uint prevVersion,
        address publisher,
        address[] authors,
        string contentHash,
        string message
    );

    event NewsUpvoted (
        uint indexed newsID,
        address voter,
        int votingPower,
        int currentRep,
        string message
    );

    event NewsDownvoted (
        uint indexed newsID,
        address voter,
        int votingPower,
        int currentRep,
        string message
    );

    event FlagCreated (
        uint indexed newsID,
        uint indexed flagID,
        address flagger,
        string contentHash,
        uint expirySeconds,
        string message
    );

    event FlagAccepted (
        uint indexed newsID,
        uint indexed flagID,
        uint prevVersion,
        address publisher,
        address[] authors,
        address flagger,
        string contentHash,
        string message
    );

    event FlagRejected (
        uint indexed newsID,
        uint indexed flagID,
        address counterflagger,
        string counterflagWriteup,
        string message
    );

    event CounterflagUpvoted (
        uint indexed newsID,
        uint indexed flagID,
        address voter,
        int votingPower,
        int currentRep,
        string message
    );

    event CounterflagDownvoted (
        uint indexed newsID,
        uint indexed flagID,
        address voter,
        int votingPower,
        int currentRep,
        string message
    );

    mapping(uint => Publication) public publications;
    mapping(uint => Flag) public flags;
    mapping(uint => mapping(address => bool)) public newsUpvoters;
    mapping(uint => mapping(address => bool)) public newsDownvoters;

    constructor (address contractAddr) {
        userManager = UserManager(contractAddr);
    }

    function findIndexByAddr(address value, address[] memory arr ) private returns(uint) {
        uint i = 0;
        while (arr[i] != value) {
            i++;
        }
        return i;
    }

    function publishDraft(
        string memory _title, 
        address[] memory _authors, 
        address _publisher,
        string memory _contentHash) public
        returns(uint) {
            require(userManager.isAuthor(msg.sender), "User is not a registered author");
            require(userManager.isInPublisher(msg.sender, _publisher), "User with this public key already exist!");
            publications[currentNews].title = _title;
            publications[currentNews].authors = _authors;
            publications[currentNews].publisher = _publisher;
            publications[currentNews].contentHash = _contentHash;
            publications[currentNews].rep = 1;
            userManager.incrementPublisherRep(_publisher, 1);
            for(uint i = 0; i < _authors.length; i++) {
                userManager.incrementUserRep(_authors[i], 1); // increase authors rep score by 1
            }
            emit NewsPublished(currentNews, _title, _publisher, 
            _authors, _contentHash, "A new publication has been created");
            currentNews += 1;
            return currentNews;
        }

    function createRevision(
        uint _newsID, 
        string memory _title,
        address[] memory _authors,
        address _publisher,
        string memory _contentHash
        ) public
        returns(uint) {
            require(userManager.isAuthor(msg.sender), "User is not a registered author");
            require(userManager.isInPublisher(msg.sender, _publisher), "User with this public key already exist!");
            require(publications[_newsID].nextVersion == NULL, "This publication already has a revision!");
            publications[currentNews].title = _title;
            publications[currentNews].authors = _authors;
            publications[currentNews].publisher = _publisher;
            publications[currentNews].contentHash = _contentHash;
            publications[currentNews].rep = 1;
            publications[currentNews].prevVersion = _newsID;
            publications[currentNews].flags = publications[_newsID].flags;
            publications[_newsID].nextVersion = currentNews;
            userManager.incrementPublisherRep(_publisher, 1);
            for(uint i = 0; i < _authors.length; i++) {
                userManager.incrementUserRep(_authors[i], 1); // increase authors rep score by 1
            }
            emit NewsRevised(currentNews, _newsID, _publisher, 
            _authors, _contentHash, "A publication has been revised");
            currentNews += 1;
            return currentNews;
        }
    
    function upvoteNews(
        uint _newsID
        ) public
        returns(int) {
            require (userManager.isRegistered(msg.sender), 
            "This user is not registered!");
            require (userManager.getRep(msg.sender) > 0, 
            "Insufficient rep score to vote");
            require(!isUpvoter(msg.sender, _newsID), 
            "User already voted the news");
            require(!isDownvoter(msg.sender, _newsID), 
            "User already voted the news");
            require(!userManager.isInPublisher(msg.sender, publications[_newsID].publisher),
             "Voter is not allowed to vote on article of the same publisher");
            int votingPower = 0;
            if (userManager.getRep(msg.sender) > repLimit) {
                votingPower = repLimit;
            }
            else {
                votingPower = userManager.getRep(msg.sender);
            }
            publications[_newsID].rep += votingPower;
            publications[_newsID].upvoter.push(msg.sender);
            newsUpvoters[_newsID][msg.sender] = true;
            userManager.incrementPublisherRep(publications[_newsID].publisher, votingPower);
            for(uint i = 0; i < publications[_newsID].authors.length; i++) {
                userManager.incrementUserRep(publications[_newsID].authors[i], votingPower); // increase authors rep score by 1
            }
            emit NewsUpvoted(_newsID, msg.sender, votingPower,
            publications[_newsID].rep, "A news has been upvoted");
            return publications[_newsID].rep;
        }

    function downvoteNews(
        uint _newsID
        ) public
        returns(int) {
            require (userManager.isRegistered(msg.sender), 
            "This user is not registered!");
            require (userManager.getRep(msg.sender) > 0, 
            "Insufficient rep score to vote");
            require(!isUpvoter(msg.sender, _newsID), 
            "User already voted the news");
            require(!isDownvoter(msg.sender, _newsID), 
            "User already voted the news");
            require(!userManager.isInPublisher(msg.sender, publications[_newsID].publisher),
             "Voter is not allowed to vote on article of the same publisher");
            int votingPower = 0;
            if (userManager.getRep(msg.sender) > repLimit) {
                votingPower = repLimit;
            }
            else {
                votingPower = userManager.getRep(msg.sender);
            }
            publications[_newsID].rep -= votingPower;
            publications[_newsID].downvoter.push(msg.sender);
            newsDownvoters[_newsID][msg.sender] = true;
            userManager.decrementPublisherRep(publications[_newsID].publisher, votingPower);
            for(uint i = 0; i < publications[_newsID].authors.length; i++) {
                userManager.decrementUserRep(publications[_newsID].authors[i], votingPower); // increase authors rep score by 1
            }
            emit NewsDownvoted(_newsID, msg.sender, votingPower,
            publications[_newsID].rep, "A news has been downvoted");
            return publications[_newsID].rep;
        }

    function submitFlag(
        string memory _subject, 
        string memory _contentHash,
        uint _newsID,
        uint _expirySeconds) public
        returns(uint) {
            require (userManager.isRegistered(msg.sender), 
            "This user is not registered!");
            require(!userManager.isInPublisher(msg.sender, publications[_newsID].publisher),
                "Voter is not allowed to vote on article of the same publisher");
            require(publicationExist(_newsID), "News does not exist!");
            flags[currentFlag].subject = _subject;
            flags[currentFlag].flagger = msg.sender;
            flags[currentFlag].contentHash = _contentHash;
            flags[currentFlag].expirySeconds = _expirySeconds;
            flags[currentFlag].newsID = _newsID;
            emit FlagCreated(_newsID, currentFlag, msg.sender, 
            _contentHash, _expirySeconds, "A new flag has been created");
            currentFlag += 1;
            return currentFlag;
        }

    function isUpvoter(address user, uint _newsID) public view
    returns(bool) {
        return newsUpvoters[_newsID][user];
    }

    function isDownvoter(address user, uint _newsID) public view
    returns(bool) {
        return newsDownvoters[_newsID][user];
    }

    function publicationExist(uint _newsID) public view
    returns(bool) {
        return (_newsID <= currentNews);
    }
}