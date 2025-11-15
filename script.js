// script.js
// Contract Addresses
const NFT_CONTRACT_ADDRESS = '0xe78B7c61B73FE0FBa08dFCd0d413aab465d0D520';
const EURC_TOKEN_ADDRESS = '0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a';

// Arc Testnet RPC
const ARC_RPC = 'https://rpc.testnet.arc.network';
const CHAIN_ID = 5042002;

// Contract ABIs
const NFT_ABI = [
    {
        "inputs": [
            {"internalType": "string", "name": "_baseTokenURI", "type": "string"},
            {"internalType": "address", "name": "_treasuryWallet", "type": "address"}
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "inputs": [{"internalType": "uint256", "name": "nftType", "type": "uint256"}],
        "name": "mintNFT",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getTotalMinted",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "uint256", "name": "nftType", "type": "uint256"}],
        "name": "getMintedCountPerType",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "address", "name": "wallet", "type": "address"}],
        "name": "getMintedCountPerWallet",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    }
];

const EURC_ABI = [
    {
        "inputs": [
            {"internalType": "address", "name": "spender", "type": "address"},
            {"internalType": "uint256", "name": "amount", "type": "uint256"}
        ],
        "name": "approve",
        "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
        "name": "balanceOf",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {"internalType": "address", "name": "owner", "type": "address"},
            {"internalType": "address", "name": "spender", "type": "address"}
        ],
        "name": "allowance",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    }
];

// Global Variables
let web3;
let nftContract;
let eurcContract;
let userAddress;

// NFT Data with Pinata Links
const nftData = [
    { 
        id: 1, 
        name: "Cyberpunk Coffee", 
        video: "https://gateway.pinata.cloud/ipfs/bafybeicpkt56ifv3k3w5ojukhuyd4i7ae6teh6qgmikds4ljg654yn2r64/1-cyberpunk-coffee.mp4", 
        description: "Futuristic cyberpunk coffee scene" 
    },
    { 
        id: 2, 
        name: "Bumbfounded", 
        video: "https://gateway.pinata.cloud/ipfs/bafybeicpkt56ifv3k3w5ojukhuyd4i7ae6teh6qgmikds4ljg654yn2r64/2-bumbfounded.mp4", 
        description: "Surprising animated moment" 
    },
    { 
        id: 3, 
        name: "Storyboard", 
        video: "https://gateway.pinata.cloud/ipfs/bafybeicpkt56ifv3k3w5ojukhuyd4i7ae6teh6qgmikds4ljg654yn2r64/3-storyboard.mp4", 
        description: "Creative storyboard process" 
    },
    { 
        id: 4, 
        name: "Energy Lights", 
        video: "https://gateway.pinata.cloud/ipfs/bafybeicpkt56ifv3k3w5ojukhuyd4i7ae6teh6qgmikds4ljg654yn2r64/4-energy-lights.mp4", 
        description: "Vibrant energy lights in motion" 
    },
    { 
        id: 5, 
        name: "Digital Abstract", 
        video: "https://gateway.pinata.cloud/ipfs/bafybeicpkt56ifv3k3w5ojukhuyd4i7ae6teh6qgmikds4ljg654yn2r64/5-digital-abstract.mp4", 
        description: "Abstract digital art creation" 
    },
    { 
        id: 6, 
        name: "AI Prompt", 
        video: "https://gateway.pinata.cloud/ipfs/bafybeicpkt56ifv3k3w5ojukhuyd4i7ae6teh6qgmikds4ljg654yn2r64/6-ai-prompt.mp4", 
        description: "AI generated visualization" 
    },
    { 
        id: 7, 
        name: "Muscle Rat", 
        video: "https://gateway.pinata.cloud/ipfs/bafybeicpkt56ifv3k3w5ojukhuyd4i7ae6teh6qgmikds4ljg654yn2r64/7-muscle-rat.mp4", 
        description: "Strong rodent character animation" 
    },
    { 
        id: 8, 
        name: "The Storm", 
        video: "https://gateway.pinata.cloud/ipfs/bafybeicpkt56ifv3k3w5ojukhuyd4i7ae6teh6qgmikds4ljg654yn2r64/8-the-storm.mp4", 
        description: "Powerful storm weather animation" 
    },
    { 
        id: 9, 
        name: "Origami Bunny", 
        video: "https://gateway.pinata.cloud/ipfs/bafybeicpkt56ifv3k3w5ojukhuyd4i7ae6teh6qgmikds4ljg654yn2r64/9-origami-bunny.mp4", 
        description: "Paper origami bunny animation" 
    },
    { 
        id: 10, 
        name: "Urban Leans", 
        video: "https://gateway.pinata.cloud/ipfs/bafybeicpkt56ifv3k3w5ojukhuyd4i7ae6teh6qgmikds4ljg654yn2r64/10-urban-leans.mp4", 
        description: "Urban style leaning animation" 
    },
    { 
        id: 11, 
        name: "Futuristic Robots", 
        video: "https://gateway.pinata.cloud/ipfs/bafybeicpkt56ifv3k3w5ojukhuyd4i7ae6teh6qgmikds4ljg654yn2r64/11-futuristic-robots.mp4", 
        description: "Two humanoid robots futuristic setting" 
    },
    { 
        id: 12, 
        name: "Point of View", 
        video: "https://gateway.pinata.cloud/ipfs/bafybeicpkt56ifv3k3w5ojukhuyd4i7ae6teh6qgmikds4ljg654yn2r64/12-point-of-view.mp4", 
        description: "First person perspective animation" 
    }
];

// Initialize App
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    loadNFTs();
});

// Initialize Web3
async function initializeApp() {
    if (typeof window.ethereum !== 'undefined') {
        web3 = new Web3(window.ethereum);
        await initializeContracts();
    } else {
        alert('Please install MetaMask!');
    }
}

// Initialize Contracts
async function initializeContracts() {
    try {
        nftContract = new web3.eth.Contract(NFT_ABI, NFT_CONTRACT_ADDRESS);
        eurcContract = new web3.eth.Contract(EURC_ABI, EURC_TOKEN_ADDRESS);
        console.log('Contracts initialized');
    } catch (error) {
        console.error('Error initializing contracts:', error);
    }
}

// Load NFTs to Grid
function loadNFTs() {
    const nftGrid = document.getElementById('nftGrid');
    nftGrid.innerHTML = '';

    nftData.forEach(nft => {
        const nftCard = `
            <div class="nft-card">
                <video class="nft-video" autoplay loop muted playsinline>
                    <source src="${nft.video}" type="video/mp4">
                    Your browser does not support the video tag.
                </video>
                <div class="nft-info">
                    <h3>${nft.name}</h3>
                    <p>${nft.description}</p>
                    <p><strong>Price: 10 EURC</strong></p>
                    <button class="mint-btn" onclick="mintNFT(${nft.id})" id="mintBtn${nft.id}">
                        Mint NFT
                    </button>
                    <p class="mint-count" id="mintCount${nft.id}">Minted: 0/1000</p>
                </div>
            </div>
        `;
        nftGrid.innerHTML += nftCard;
    });
}

// Connect Wallet
document.getElementById('connectWallet').addEventListener('click', connectWallet);

// Disconnect Wallet
document.getElementById('disconnectWallet').addEventListener('click', disconnectWallet);

// Connect Wallet Function
async function connectWallet() {
    try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const accounts = await web3.eth.getAccounts();
        userAddress = accounts[0];
        
        await switchToArcNetwork();
        await updateWalletInfo();
        await updateBalances();
        await updateMintCounts();
        
        document.getElementById('connectWallet').style.display = 'none';
        document.getElementById('disconnectWallet').style.display = 'block';
        
        showMessage('Wallet connected successfully!', 'success');
        
    } catch (error) {
        console.error('Error connecting wallet:', error);
        showMessage('Error connecting wallet', 'error');
    }
}

// Switch to Arc Network
async function switchToArcNetwork() {
    try {
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: web3.utils.toHex(CHAIN_ID) }],
        });
    } catch (switchError) {
        if (switchError.code === 4902) {
            try {
                await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [{
                        chainId: web3.utils.toHex(CHAIN_ID),
                        chainName: 'Arc Testnet',
                        rpcUrls: [ARC_RPC],
                        nativeCurrency: {
                            name: 'USDC',
                            symbol: 'USDC',
                            decimals: 18
                        },
                        blockExplorerUrls: ['https://testnet.arcscan.app/']
                    }],
                });
            } catch (addError) {
                console.error('Error adding network:', addError);
            }
        }
    }
}

// Disconnect Wallet
function disconnectWallet() {
    userAddress = null;
    document.getElementById('connectWallet').style.display = 'block';
    document.getElementById('disconnectWallet').style.display = 'none';
    document.getElementById('walletInfo').textContent = '';
    document.getElementById('eurcBalance').textContent = '0';
    
    showMessage('Wallet disconnected', 'success');
}

// Update Wallet Info
async function updateWalletInfo() {
    if (userAddress) {
        const shortAddress = `${userAddress.substring(0, 6)}...${userAddress.substring(38)}`;
        document.getElementById('walletInfo').textContent = `Connected: ${shortAddress}`;
    }
}

// Update Balances
async function updateBalances() {
    if (userAddress) {
        try {
            const eurcBalance = await eurcContract.methods.balanceOf(userAddress).call();
            document.getElementById('eurcBalance').textContent = (eurcBalance / 1e6).toFixed(2);
        } catch (error) {
            console.error('Error updating balances:', error);
        }
    }
}

// Update Mint Counts
async function updateMintCounts() {
    try {
        let totalMinted = 0;
        
        for (let i = 1; i <= 12; i++) {
            const minted = await nftContract.methods.getMintedCountPerType(i).call();
            document.getElementById(`mintCount${i}`).textContent = `Minted: ${minted}/1000`;
            totalMinted += parseInt(minted);
        }
        
        document.getElementById('mintedCount').textContent = totalMinted;
        updateProgressBar(totalMinted);
        
    } catch (error) {
        console.error('Error updating mint counts:', error);
    }
}

// Update Progress Bar
function updateProgressBar(minted) {
    const progress = (minted / 12000) * 100;
    document.getElementById('progressFill').style.width = `${progress}%`;
}

// Mint NFT Function
async function mintNFT(nftType) {
    if (!userAddress) {
        showMessage('Please connect your wallet first!', 'error');
        return;
    }

    const mintButton = document.getElementById(`mintBtn${nftType}`);
    mintButton.disabled = true;
    mintButton.textContent = 'Minting...';

    try {
        // Check EURC balance
        const eurcBalance = await eurcContract.methods.balanceOf(userAddress).call();
        const requiredAmount = 10 * 1e6;

        if (eurcBalance < requiredAmount) {
            throw new Error('Insufficient EURC balance');
        }

        // Check if approval is needed
        const allowance = await eurcContract.methods.allowance(userAddress, NFT_CONTRACT_ADDRESS).call();
        if (allowance < requiredAmount) {
            await approveEURC();
        }

        // Mint NFT
        await nftContract.methods.mintNFT(nftType).send({ from: userAddress });
        
        showMessage(`NFT #${nftType} minted successfully!`, 'success');
        await updateBalances();
        await updateMintCounts();
        
    } catch (error) {
        console.error('Error minting NFT:', error);
        showMessage(`Minting failed: ${error.message}`, 'error');
    } finally {
        mintButton.disabled = false;
        mintButton.textContent = 'Mint NFT';
    }
}

// Approve EURC
async function approveEURC() {
    try {
        const amount = '115792089237316195423570985008687907853269984665640564039457584007913129639935'; // Max approval
        await eurcContract.methods.approve(NFT_CONTRACT_ADDRESS, amount).send({ from: userAddress });
        showMessage('EURC approval successful!', 'success');
    } catch (error) {
        throw new Error('EURC approval failed');
    }
}

// Show Message
function showMessage(message, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = type === 'success' ? 'success-message' : 'error-message';
    messageDiv.textContent = message;
    messageDiv.style.display = 'block';
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.remove();
    }, 5000);
}

// Listen for account changes
window.ethereum.on('accountsChanged', (accounts) => {
    if (accounts.length === 0) {
        disconnectWallet();
    } else {
        userAddress = accounts[0];
        updateWalletInfo();
        updateBalances();
        updateMintCounts();
    }
});

// Listen for chain changes
window.ethereum.on('chainChanged', (chainId) => {
    if (parseInt(chainId) !== CHAIN_ID) {
        showMessage('Please switch to Arc Testnet', 'error');
    } else {
        initializeContracts();
        updateBalances();
        updateMintCounts();
    }
});
