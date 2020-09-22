pragma solidity ^0.6.0;

import "./ItemManager.sol";

contract Item {
    uint public priceInWei;
    uint public pricePaid;
    uint public itemIndex;
    ItemManager parentContract;
    
    constructor(ItemManager _parenContract, uint _itemIndex, uint _priceInWei) public {
        priceInWei = _priceInWei;
        itemIndex = _itemIndex;
        parentContract = _parenContract;
    }
    
    // receive will be triggered when fund is sent
    receive() external payable {
        require(pricePaid == 0, "Item is paid!");
        require(priceInWei == msg.value, "Only full payment allowed!");
        
        // GOAL: trigger payment function in parent contract once payment is received
        
        // even if the parentContract is marked as `payable`. The following code WON'T work!
        // reason: function transfer only use certain amount of gas (21000 ~ 23000) which is not enough
        // if you want to trigger another function in other contract (in this case is parent contract)
        // address(parentContract).transfer(msg.value);
        
        // in this case, we use the following low-level function call
        // ref: https://solidity.readthedocs.io/en/v0.5.13/types.html?highlight=call.value#members-of-addresses
        // IMPORTANT!!!!! we need to always listen to the returned value!! (
        // 1. either bool - if the function does not return data, or 
        // 2. byte data-if the function returns data
        // )
        
        // in our case, our triggerPayment function does not return value, so the return value will be bool
        (bool success, ) = address(parentContract).call.value(msg.value)(abi.encodeWithSignature("triggerPayment(uint256)", itemIndex));
        require(success, "Payment failed! Reverting transaction!");
        pricePaid += msg.value;
    }
    
    // fallback will be triggered when data is sent along
    fallback() external {
        
    }
}