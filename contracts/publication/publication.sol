// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.3;

contract Publication {

    struct Publication {
        string articleHash;
        string status;
        address[] authors;
    }

    mapping(string => Publication) publications;

    function publish(address[] memory newsAuthors, string memory id, string memory newsHash) public {
        bytes memory publicationByte = bytes(publications[id].articleHash);
        require(publicationByte.length == 0, "Article is already published!");
        publications[id].articleHash = newsHash;
        publications[id].status = "Published";
        publications[id].authors = newsAuthors;
    }

    function find(address value, address[] memory arr ) private returns(uint) {
        uint i = 0;
        while (arr[i] != value) {
            i++;
        }
        return i;
    }
}