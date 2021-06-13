// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.3;
import "./UserManager.sol";

contract NewsroomManager {

    uint constant NULL = 0;
    int constant repLimit = 10;
    uint constant expirySeconds = 7200 seconds;
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
        uint submittedAt;
        address payable flagger;
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
        uint submittedAt,
        uint expirySeconds,
        uint stakeDeposited,
        string message
    );

    event FlagAccepted (
        uint indexed newsID,
        uint indexed flagID,
        uint prevVersion,
        address publisher,
        address[] authors,
        address flagger,
        address counterFlagger,
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

    event StakeWithdrawn (
        address flagger,
        uint flagID,
        uint amount,
        string message
    );

    mapping(uint => Publication) public publications;
    mapping(uint => Flag) public flags;
    mapping(uint => mapping(address => bool)) public newsUpvoters;
    mapping(uint => mapping(address => bool)) public newsDownvoters;
    mapping(uint => uint) public stakes;

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
        uint _expirySeconds) public payable
        returns(uint) {
            require (userManager.isRegistered(msg.sender), 
            "This user is not registered!");
            require(!userManager.isInPublisher(msg.sender, publications[_newsID].publisher),
                "Voter is not allowed to vote on article of the same publisher");
            require(publicationExist(_newsID), "News does not exist!");
            flags[currentFlag].subject = _subject;
            flags[currentFlag].flagger = payable(msg.sender);
            flags[currentFlag].contentHash = _contentHash;
            flags[currentFlag].expirySeconds = _expirySeconds;
            flags[currentFlag].newsID = _newsID;
            flags[currentFlag].submittedAt = block.timestamp;
            stakes[currentFlag] = msg.value;
            emit FlagCreated(_newsID, currentFlag, msg.sender, 
            _contentHash, block.timestamp, _expirySeconds, msg.value,
             "A new flag has been created");
            currentFlag += 1;
            return currentFlag;
        }

    function rejectFlag(uint _flagID, string memory _counterflagWriteup) 
        public payable
        returns(bool) {
            address publisher = publications[flags[_flagID].newsID].publisher;
            require(!isIgnored(flags[_flagID]), "This flag is already expired");
            require(userManager.isInPublisher(msg.sender, publisher), 
            "Counterflagger is not within the same publisher");
            flags[_flagID].status = 2;
            flags[_flagID].counterflagWriteup = _counterflagWriteup;
            flags[_flagID].counterFlagger;
            flags[_flagID].flagger.transfer(stakes[_flagID]);
            emit FlagRejected(
                flags[_flagID].newsID, 
                _flagID, 
                msg.sender, 
                _counterflagWriteup, 
                "A flag has been rejected");
            stakes[_flagID] = 0;
            return true;
        }

    function acceptFlag(
        uint _flagID, 
        string memory _title,
        address[] memory _authors,
        string memory _contentHash
    ) public payable
    returns(uint) {
        uint _newsID = flags[_flagID].newsID;
        address _publisher = publications[_newsID].publisher;
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
        currentNews += 1;
        flags[_flagID].status = 1;
        flags[_flagID].counterFlagger = msg.sender;
        stakes[_flagID] += msg.value;
        flags[_flagID].flagger.transfer(stakes[_flagID]);
        emit FlagAccepted(
            _newsID, 
            _flagID, 
            _newsID, 
            _publisher, 
            _authors, 
            flags[_flagID].flagger, 
            msg.sender,
            _contentHash, 
            "A flag has been accepted");
        stakes[_flagID] = 0;
        return currentNews;
    }

    function withdrawStake(uint _flagID) public returns(uint) {
        require(isIgnored(flags[_flagID]), "Flag hasn't been ignored, wait until flag is expired");
        require(isFlagger(msg.sender, _flagID), "User is not the flagger");
        flags[_flagID].flagger.transfer(stakes[_flagID]);
        stakes[_flagID] = 0;
        flags[_flagID].status = 3;
        emit StakeWithdrawn(msg.sender, _flagID, stakes[_flagID], 
        "A flag has been ignored and the stake withdrawn");
        return _flagID;
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

    function isIgnored(Flag memory flag) public view
    returns(bool) {
        if (flag.status == 1) {
            return true;
        }
        else {
            return((block.timestamp - flag.submittedAt) > expirySeconds);
        }
    }

    function isFlagger(address flagger, uint _flagID) public view
    returns(bool) {
        return(flagger == flags[_flagID].flagger);
    }

    function getHash(uint _newsID) public view
    returns(string memory) {
        return publications[_newsID].contentHash;
    }
}