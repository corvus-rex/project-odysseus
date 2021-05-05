// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.3;

contract Registration {

    struct User {
        string email;
        bool authorship;
        uint rep;
    }

    struct Publisher {
        string name;
        uint rep;
        address chiefOfficer;
        address[] authors;
    }

    mapping(address => User) users;
    mapping(address => Publisher) publishers;
    address[] private authorAddr;

    function newUser(string memory email, address key) public {
        bytes memory emailByte = bytes(users[key].email); // Uses memory
        require(emailByte.length == 0, "Public key already exist!");
        users[key].email = email;
        users[key].authorship = false;
        users[key].rep = 0;
    }

    function registerPublisher(string memory name) payable public {
        address payable _chiefOfficer = payable(msg.sender);
        bytes memory nameByte = bytes(publishers[_chiefOfficer].name); // Uses memory
        require(nameByte.length == 0, "User already created a publication");
        authorAddr.push(msg.sender);
        publishers[_chiefOfficer].name = name;
        publishers[_chiefOfficer].rep = 0;
        publishers[_chiefOfficer].authors = authorAddr;
        delete authorAddr;
        _chiefOfficer.transfer(msg.value);
    }

    function electAuthorship(address newAuthor) public {
        address _chiefOfficer = msg.sender;
        publishers[_chiefOfficer].authors.push(newAuthor);
        users[newAuthor].authorship = true;
    }

    function getUser(address key) public view returns (string memory email) {
        email = users[key].email;
    }
}