# Duperchat

A decentralised tool for donations with messages written as a Smart Contract for Ethereum Virtual Machine.

## Donate Contract

For now, the person that deploys the contract is the owner of the contract.

### Public Methods

Returns the balance the contract contains (in native currency):
```
getTotalBalance()
```

Returns the total messages the contract received:
```
getTotalMessages() uint
```

Get the message based on a position in the array.
The current POC is saving messages on IPFS.
The message in the array will be an address from IPFS pointing to the content of the message.

```
getMessage(uint index) string
```

Send a message via the `Payable` function, with the amount you want to donate.
```
sendMessage(string message)
```

### Owner Methods

To withdraw the balance from the contract to the owners's address
```
withdrawBalance()
```

## Next Steps:

- [ ] Create a contract that creates Donate contracts and uses aliases to find them
- [ ] Increase security or remove in `Donate.setOwner`
- [ ] Create a Proxy Contract

## Development

For development, this project uses Hardhat.
Try running some of the following tasks:

```shell
npx hardhat accounts
npx hardhat compile
npx hardhat clean
npx hardhat test
npx hardhat node
node scripts/sample-script.js
npx hardhat help
```
