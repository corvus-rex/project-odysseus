// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.3;

contract Publication {

    struct Publication {
        string articleHash;
        string status;
        bool revised;
        address[] authors;
        string prevVersion;
        string nextVersion;
    }

    mapping(string => Publication) publications;

    function publish(address[] memory newsAuthors, string memory id, string memory newsHash) public {
        bytes memory publicationByte = bytes(publications[id].articleHash);
        require(publicationByte.length == 0, "Article is already published!");
        publications[id].articleHash = newsHash;
        publications[id].status = "Published";
        publications[id].authors = newsAuthors;
        publications[id].revised = false;
    }

    function revise(address[] memory newsAuthors, string memory id, string memory newsHash, string memory lastVers) public {
        bytes memory publicationByte = bytes(publications[id].articleHash);
        require(publicationByte.length == 0, "Article is already published!");
        publications[lastVers].revised = true;
        publications[lastVers].nextVersion = id;
        publications[id].articleHash = newsHash;
        publications[id].status = "Published";
        publications[id].authors = newsAuthors;
        publications[id].revised = false;
        publications[id].prevVersion = lastVers;
    }

    function find(address value, address[] memory arr ) private returns(uint) {
        uint i = 0;
        while (arr[i] != value) {
            i++;
        }
        return i;
    }
}