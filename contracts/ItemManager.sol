pragma solidity ^0.6.0;

import "./Item.sol";

contract ItemManager {
    
    enum SupplyChainState {
        CREATED,    // 0
        PAID,       // 1
        DELIVERED   // 2
    }
    
    struct ItemInfo {
        Item _item;
        string _id;
        uint _itemPrice;
        ItemManager.SupplyChainState _state;
    }
    
    mapping(uint => ItemInfo) public items;
    uint itemIndex;
    event supplyChainInfoEvent(uint indexed _itemIndex, uint indexed _state, address indexed _itemAddress);
    
    function createItem(string memory _id, uint _itemPrice) public {
        Item item = new Item(this, itemIndex, _itemPrice);
        items[itemIndex] = ItemInfo(item, _id, _itemPrice, SupplyChainState.CREATED);
        emit supplyChainInfoEvent(itemIndex, uint(items[itemIndex]._state), address(item));
        itemIndex++;
    }
    
    function triggerPayment(uint _itemIndex) public payable {
        require(items[_itemIndex]._itemPrice == msg.value, "Only full payment accepted!");
        require(items[_itemIndex]._state == SupplyChainState.CREATED, "Item is further in the chain!");
        items[_itemIndex]._state = SupplyChainState.PAID;
        emit supplyChainInfoEvent(_itemIndex, uint(items[_itemIndex]._state), address(items[_itemIndex]._item));
    }
    
    function triggerDelivery(uint _itemIndex) public {
        require(items[_itemIndex]._state == SupplyChainState.PAID, "Item is further in the chain!");
        items[_itemIndex]._state = SupplyChainState.DELIVERED;
        emit supplyChainInfoEvent(_itemIndex, uint(items[_itemIndex]._state), address(items[_itemIndex]._item));
    }
}
