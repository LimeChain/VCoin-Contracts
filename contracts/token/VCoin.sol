pragma solidity >=0.6.7 <0.7.0;// SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/presets/ERC20PresetMinterPauser.sol";

contract VCoin is ERC20PresetMinterPauser {
    constructor() public ERC20PresetMinterPauser("VCOIN", "VCO") {}
}
