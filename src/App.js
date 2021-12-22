import './App.css';
import { useState } from 'react';
import { ethers } from 'ethers'
import { create as createIPFSClient } from 'ipfs-http-client'
import styled, { css } from 'styled-components';

import Donate from './artifacts/contracts/Donate.sol/Donate.json'

// Update with the contract address logged out to the CLI when it was deployed 
const donateAddress = "0x8A791620dd6260079BF849Dc5567aDC3F2FdC318"

// IPFS Client
const IPFSClient = createIPFSClient('https://ipfs.infura.io:5001/api/v0')

const FormContainer = styled.div`
  display: block;
  width: 30%;
  border: 1px solid #C00;
`

const Label = styled.label`
  display: flex;
  flex-direction: column;
  width: 100%;
  align-items: start;
  padding: 10px;
  box-sizing: border-box;
  font-size: 1.2rem;
  line-height: 2.2rem;

  input, textarea {
    width: 100%;
    padding: 10px;
    box-sizing: border-box;
    font-size: 1.2rem;
  }

  textarea {
    height: 100px;
  }
`

const ButtonArea = styled.div`
  display: flex;
  flex-direction: row;
  margin-top: 20px;
`

const Button = styled.button`
  width: 100%;
  padding: 10px;
  margin: 10px;
  box-sizing: border-box;
  font-size: 1.2rem;
  background-color: #fff;
  border: 1px solid #424242;

  ${props => props.primary && css`
    background-color: palevioletred;
  `}

`

function App() {
  // store greeting in local state
  const [totalMessages, setTotalMessages] = useState('')
  const [totalValue, setTotalValue] = useState('')
  const [messageToSend, setMessageToSend] = useState('')
  const [author, setAuthor] = useState('')
  const [valueToSend, setValueToSend] = useState('1')

  const [currentIndex, setCurrentIndex] = useState(-1)
  const [currentAuthor, setCurrentAuthor] = useState('')
  const [currentMessage, setCurrentMessage] = useState('')

  // request access to the user's MetaMask account
  async function requestAccount() {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
  }

  // call the smart contract, read the current greeting value
  async function fetchTotalMessages() {
    if (typeof window.ethereum !== 'undefined') {
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const contract = new ethers.Contract(donateAddress, Donate.abi, provider)
      try {
        const totalMsgs = await contract.getTotalMessages()
        setTotalMessages(totalMsgs.toNumber())
        
        const totalValue = await contract.getTotalBalance()
        setTotalValue(ethers.utils.formatEther(totalValue))

        if (currentIndex === -1) {
          fetchMessage(0)
        }
      } catch (err) {
        console.log("Error: ", err)
      }
    }    
  }

  async function fetchMessage(index) {
    if (index === -1) return
    if (index >= totalMessages) return

    if (typeof window.ethereum !== 'undefined') {
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const contract = new ethers.Contract(donateAddress, Donate.abi, provider)

      let values

      try {
        values = await contract.getMessage(index)
      } catch(err) {
        console.log("Error: ", err)
      }


      let {
        from,
        message,
        // value,
      } = values

      try {
        const jsonMessage = await fetch(`https://ipfs.infura.io/ipfs/${message}`)
          .then((res) => res.json())

        console.log({ jsonMessage })

        if (jsonMessage.message) {
          message = jsonMessage.message
        }
        
        if (jsonMessage.author) {
          from = jsonMessage.author
        }
      } catch(err) {
        console.log(`IPFS Error for patch ${currentMessage}`, err)
      }

      setCurrentAuthor(from)
      setCurrentMessage(message)
      setCurrentIndex(index)
    }    
  }

  // call the smart contract, send an update
  async function sendMessage() {
    if (!messageToSend) return
    if (!valueToSend) return
    if (typeof window.ethereum !== 'undefined') {
      await requestAccount()
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner()
      const contract = new ethers.Contract(donateAddress, Donate.abi, signer)

      const message = {
        author: author || null,
        message: messageToSend,
      }

      const { path } = await IPFSClient.add(JSON.stringify(message))
      console.log({path})

      const transaction = await contract.sendMessage(path, { value: ethers.utils.parseEther(valueToSend) })
      await transaction.wait()

      fetchTotalMessages()
    }
  }

  async function withdrawValue() {
    if (typeof window.ethereum !== 'undefined') {
      await requestAccount()
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner()
      const contract = new ethers.Contract(donateAddress, Donate.abi, signer)
      const transaction = await contract.withdrawBalance()
      await transaction.wait()
      fetchTotalMessages()
    }
  }

  fetchTotalMessages()

  return (
    <div className="App">
      <header className="App-header">
        <h1>Donate</h1>
        <p>Total messages: {totalMessages}</p>
        <p>Value Raised: {totalValue} ETH</p>
        <FormContainer>
          <Label>
            Author:
            <input value={author} onChange={e => setAuthor(e.target.value)} placeholder="Author (leave blank for annonymous)" />
          </Label>
          <Label>
            Message:
            <textarea value={messageToSend} onChange={e => setMessageToSend(e.target.value)} placeholder="Set message to send" />
          </Label>
          <Label>
            Value (Eth):
            <input value={valueToSend} onChange={e => setValueToSend(e.target.value)} placeholder="1" />
          </Label>

          <ButtonArea>
            <Button primary onClick={sendMessage}>Send Message</Button>
            <Button onClick={withdrawValue}>Withdraw Value</Button>
          </ButtonArea>
        </FormContainer>
        {totalMessages > 0 && (
          <div>
            <h2>Current message: {currentIndex}</h2>
            <p>Author: {currentAuthor}</p>
            <p>Message: {currentMessage}</p>
            <ButtonArea>
              {currentIndex > 0 && <Button onClick={() => fetchMessage(currentIndex-1)}>Previous</Button>}
              {currentIndex < (totalMessages-1) && <Button onClick={() => fetchMessage(currentIndex+1)}>Next</Button>}
            </ButtonArea>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;
