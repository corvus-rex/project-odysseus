// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.3;

contract UserManager {

    uint constant NULL = 0;

    struct User {
        string username;
        int rep;
        uint role;
        address chiefOfficer;
        // ENUM ROLES
        // 1: Officer
        // 2: Author
        // 3: Reader
    }

    struct Publisher {
        string name;
        int rep;
        address[] authors;
    }

    event UserRegistered (
        address indexed userAddress,
        string username,
        string message
    );

    event PublisherCreated (
        address indexed chiefOfficer,
        string publisherName,
        string message
    );

    event AuthorshipGranted (
        address indexed newAuthor,
        address indexed chiefOfficer,
        string message
    );

    event AuthorshipRevoked (
        address indexed author,
        address indexed chiefOfficer,
        string message
    );

    mapping(address => User) public users;
    mapping(address => Publisher) public publishers;
    mapping(string => bool) public usernameExistence;
    mapping(string => bool) public publisherNameExistence;

    function findIndexByAddr(address value, address[] memory arr ) private pure returns(uint) {
        uint i = 0;
        while (arr[i] != value) {
            i++;
        }
        return i;
    }

    function newUser(string memory username, address key) public {
        require(!isRegistered(key), "User with this public key already exist!");
        require(!isUsernameUsed(username), "User with this username already exist!");
        users[key].username = username;
        users[key].rep = 0;
        users[key].role = 3; // as Reader
        users[key].chiefOfficer = address(0);
        usernameExistence[username] = true;
        emit UserRegistered(key, username, "New user has been created");
    }

    function registerPublisher(string memory name) public {
        require(!isChiefOfficer(msg.sender), "User already created a publication");
        require(!isPublisherNameUsed(name), "Publisher with this name already exist");
        publishers[msg.sender].name = name;
        publishers[msg.sender].rep = 0;
        publishers[msg.sender].authors.push(msg.sender);
        users[msg.sender].role = 1; // as Officer
        users[msg.sender].chiefOfficer = msg.sender;
        publisherNameExistence[name] = true;
        emit PublisherCreated(msg.sender, name, "New Publisher has been created");
    }

    function grantAuthorship(address newAuthor) public {
        require(isChiefOfficer(msg.sender), "Sender is not a chief officer!");
        require(isRegistered(newAuthor), "User to granted authorship does not exist");
        require(!isAuthor(newAuthor), "User is already an author");
        publishers[msg.sender].authors.push(newAuthor);
        users[newAuthor].role = 2; // as Author
        users[newAuthor].chiefOfficer = msg.sender;
        emit AuthorshipGranted(newAuthor, msg.sender, "A User has been granted the position of author");
    }

    function revokeAuthorship(address author) public {
        require(isChiefOfficer(msg.sender), "Sender is not a chief officer!");
        require(isRegistered(author), "User to revoke authorship does not exist");
        require(isAuthor(author), "User is not an author");
        require(isInPublisher(author, msg.sender), "User does not belong in sender's publication");
        uint index = findIndexByAddr(author, publishers[msg.sender].authors);
        delete publishers[msg.sender].authors[index];
        users[author].role = 3; // reverted back to Reader
        users[author].chiefOfficer = address(0);
        emit AuthorshipRevoked(author, msg.sender, "A User has been revoked the position of author");
    }

    function getUsername(address key) public view 
    returns (string memory username) {
        username = users[key].username;
    }

    function getRep(address key) public view
    returns (int) {
        return users[key].rep;
    }

    function isRegistered(address key) public view
    returns(bool) {
        return(bytes(users[key].username).length > 0);
    }

    function isUsernameUsed(string memory username) public view
    returns (bool) {
        return usernameExistence[username];
    }

    function isChiefOfficer(address key) public view
    returns(bool) {
        return(bytes(publishers[key].name).length > 0);
    }

    function isPublisherNameUsed(string memory publisherName) public view
    returns (bool) {
        return publisherNameExistence[publisherName];
    }

    function isAuthor(address key) public view
    returns(bool) {
        if (users[key].role == 1 || users[key].role == 2) {
            return true;
        }
        else {
            return false;
        }
    }

    function isInPublisher(address author, address chiefOfficer) public view
    returns(bool) {
        if (users[author].chiefOfficer == chiefOfficer) {
            return true;
        }
        else {
            return false;
        }
    }

    function incrementPublisherRep(address chiefOfficer, int vote) public
    returns(bool) {
        publishers[chiefOfficer].rep += vote;
        return true;
    }

    function incrementUserRep(address user, int vote) public
    returns(bool) {
        users[user].rep += vote;
        return true;
    }

    function decrementPublisherRep(address chiefOfficer, int vote) public
    returns(bool) {
        publishers[chiefOfficer].rep -= vote;
        return true;
    }

    function decrementUserRep(address user, int vote) public
    returns(bool) {
        users[user].rep -= vote;
        return true;
    }
}