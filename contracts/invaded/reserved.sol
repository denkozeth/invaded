// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

/// @creator: denkozeth
/// Special thanks to Pak and his Censored collection for inspiring us.

//    ██ ███    ██ ██    ██  █████  ██████  ███████ ██████
//    ██ ████   ██ ██    ██ ██   ██ ██   ██ ██      ██   ██
//    ██ ██ ██  ██ ██    ██ ███████ ██   ██ █████   ██   ██
//    ██ ██  ██ ██  ██  ██  ██   ██ ██   ██ ██      ██   ██
//    ██ ██   ████   ████   ██   ██ ██████  ███████ ██████

import "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract UkReserved {
    using Strings for uint256;

    string[] private _imageParts;

    constructor() {
        _imageParts.push(
            "<svg xmlns='http://www.w3.org/2000/svg' width='1000' height='1000' viewBox='0 0 1000 1000'>"
        );
        _imageParts.push("</svg>");
    }

    function metadata() external view returns (string memory) {
        return
            string(
                abi.encodePacked(
                    'data:application/json;utf8,{"name":"Reserved", "description":"Reserved Token", "created_by":"denkozeth", "image":"data:image/svg+xml;utf8,',
                    svg(),
                    '"}'
                )
            );
    }

    function svg() public view returns (string memory) {
        bytes memory byteString;
        for (uint256 i = 0; i < _imageParts.length; i++) {
            byteString = abi.encodePacked(byteString, _imageParts[i]);
        }
        return string(byteString);
    }
}
