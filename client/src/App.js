import React, { Component } from "react";
import ItemManagerContract from "./contracts/ItemManager.json";
import ItemContract from "./contracts/Item.json";
import getWeb3 from "./getWeb3";

import "./App.css";

class App extends Component {
  state = { loaded: false, cost: 0, itemName: "" };
  items = [];

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      this.web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      this.accounts = await this.web3.eth.getAccounts();

      // Get the contract instance.
      this.networkId = await this.web3.eth.net.getId();
      console.log('id..... ', this.networkId);
      console.log('networks..... ', ItemManagerContract.networks);

      this.ItemManager = new this.web3.eth.Contract(
        ItemManagerContract.abi,
        ItemManagerContract.networks[this.networkId] && ItemManagerContract.networks[this.networkId].address,
      );

      this.Item = new this.web3.eth.Contract(
        ItemContract.abi,
        ItemContract.networks[this.networkId] && ItemContract.networks[this.networkId].address,
      );

      this.listenToEvent();

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ loaded: true });
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  handleInputChange = (event) => {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;
    this.setState({
      [name]: value
    });
  };

  handleSubmit = async() => {
    const { cost, itemName } = this.state;
    console.log('current state_ cost..... ', cost, 'itenName..... ', itemName);
    var res = await this.ItemManager.methods.createItem(itemName, cost).send({ from: this.accounts[0] });
    console.log('result..... ', res);
    this.items.push({cost: cost, itemName: itemName, address: res.events.supplyChainInfoEvent.returnValues._itemAddress});
    console.log('items..... ', this.items);
  };

  listenToEvent = async() => {
    let self = this;
    // (1) ref(we use this): 
    // https://web3js.readthedocs.io/en/v1.2.0/web3-eth-contract.html#contract-events
    // (2) ref(for eth blockchain event subscription): 
    // https://web3js.readthedocs.io/en/v1.2.0/web3-eth-subscribe.html#web3-eth-subscribe
    // (3) ref(another way to watch event that does not have topic - eg. usage using truffle framework: 
    // MyContract.Deployed().watch()): https://solidity.readthedocs.io/en/v0.6.0/contracts.html?highlight=subscribe%20event#events
    this.ItemManager.events.supplyChainInfoEvent().on('data', (event) => {
      console.log('event triggered..... ', event);
      console.log('self..... ', self);

      switch(parseInt(event.returnValues._state)) {
        case 1:
          alert(`The item ${self.state.itemName} is paid! Please deliver the item!`);
          break;
        default:
          alert(`Please pay ${self.state.cost} wei for ${self.state.itemName} to address ${event.returnValues._itemAddress}`);    
      }
    });
  };

  render() {
    if (!this.state.loaded) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }

    return (
      <div className="App">
        <h1>Event Trigger / Supply Chain Example</h1>
        <h2>Items</h2>
        <h2>Add Items</h2>
        Cost in Wei: <input type="text" name="cost" value={this.state.cost} onChange={this.handleInputChange} />
        Item Identifier: <input type="text" name="itemName" value={this.state.itemName} onChange={this.handleInputChange} />
        <button type="button" onClick={this.handleSubmit}>Create New Item</button>
      </div>
    );
  }
}

export default App;
