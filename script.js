// script.js - FINAL VERSION (November 15, 2025) - GitHub Videos + Smooth Animation Load

const NFT_CONTRACT_ADDRESS = '0xe78B7c61B73FE0FBa08dFCd0d413aab465d0D520';
const EURC_TOKEN_ADDRESS = '0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a';
const ARC_RPC = 'https://rpc.testnet.arc.network';
const CHAIN_ID = 5042002;

// Full ABI (tumhara original)
const NFT_ABI = [
    {"inputs":[{"internalType":"string","name":"_baseTokenURI","type":"string"},{"internalType":"address","name":"_treasuryWallet","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},
    {"inputs":[{"internalType":"uint256","name":"nftType","type":"uint256"}],"name":"mintNFT","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},
    {"inputs":[],"name":"getTotalMinted","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
    {"inputs":[{"internalType":"uint256","name":"nftType","type":"uint256"}],"name":"getMintedCountPerType","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
    {"inputs":[{"internalType":"address","name":"wallet","type":"address"}],"name":"getMintedCountPerWallet","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"}
];

const EURC_ABI = [
    {"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},
    {"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
    {"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"}
];

// Global vars
let web3, nftContract, eurcContract, userAddress;

// NFT Data with GitHub Paths (super fast, no CORS)
const nftData = [
    { id: 1, name: "Cyberpunk Coffee", video: "./nft-videos/1-cyberpunk-coffee.mp4", description: "Futuristic cyberpunk coffee scene" },
    { id: 2, name: "Bumbfounded", video: "./nft-videos/2-bumbfounded.mp4", description: "Surprising animated moment" },
    { id: 3, name: "Storyboard", video: "./nft-videos/3-storyboard.mp4", description: "Creative storyboard process" },
    { id: 4, name: "Energy Lights", video: "./nft-videos/4-energy-lights.mp4", description: "Vibrant energy lights in motion" },
    { id: 5, name: "Digital Abstract", video: "./nft-videos/5-digital-abstract.mp4", description: "Abstract digital art creation" },
    { id: 6, name: "AI Prompt", video: "./nft-videos/6-ai-prompt.mp4", description: "AI generated visualization" },
    { id: 7, name: "Muscle Rat", video: "./nft-videos/7-muscle-rat.mp4", description: "Strong rodent character animation" },
    { id: 8, name: "The Storm", video: "./nft-videos/8-the-storm.mp4", description: "Powerful storm weather animation" },
    { id: 9, name: "Origami Bunny", video: "./nft-videos/9-origami-bunny.mp4", description: "Paper origami bunny animation" },
    { id: 10, name: "Urban Leans", video: "./nft-videos/10-urban-leans.mp4", description: "Urban style leaning animation" },
    { id: 11, name: "Futuristic Robots", video: "./nft-videos/11-futuristic-robots.mp4", description: "Two humanoid robots futuristic setting" },
    { id: 12, name: "Point of View", video: "./nft-videos/12-point-of-view.mp4", description: "First person perspective animation" }
];

// DOM Loaded
document.addEventListener('DOMContentLoaded', () => {
    showSkeleton();
    initializeApp();
    setupEventListeners();
    loadNFTsWithAnimation();
});

// Skeleton Loader
function showSkeleton() {
    const grid = document.getElementById('nftGrid');
    grid.innerHTML = Array(12).fill().map(() => `
        <div class="nft-card skeleton-card">
            <div class="skeleton-video"></div>
            <div class="nft-info">
                <div class="skeleton-text" style="width:80%"></div>
                <div class="skeleton-text" style="width:60%"></div>
                <div class="skeleton-text" style="width:100%;height:50px"></div>
                <div class="skeleton-text" style="width:70%"></div>
            </div>
        </div>
    `).join('');
}

// Initialize App
async function initializeApp() {
    if (typeof window.ethereum !== 'undefined') {
        web3 = new Web3(window.ethereum);
        await initializeContracts();
    } else {
        showMessage('Please install MetaMask!', 'error');
    }
}

async function initializeContracts() {
    try {
        nftContract = new web3.eth.Contract(NFT_ABI, NFT_CONTRACT_ADDRESS);
        eurcContract = new web3.eth.Contract(EURC_ABI, EURC_TOKEN_ADDRESS);
        await updateMintCounts();
    } catch (e) { console.error('Contract init error:', e); }
}

function setupEventListeners() {
    document.getElementById('connectWallet').onclick = connectWallet;
    document.getElementById('disconnectWallet').onclick = disconnectWallet;
    if (window.ethereum) {
        window.ethereum.on('accountsChanged', handleAccountsChanged);
        window.ethereum.on('chainChanged', () => window.location.reload());
    }
}

// Load NFTs with Animation (No Play Button - Direct Loop on Scroll/Hover)
function loadNFTsWithAnimation() {
    const grid = document.getElementById('nftGrid');
    setTimeout(() => {
        grid.innerHTML = '';
        nftData.forEach((nft, index) => {
            const card = document.createElement('div');
            card.className = 'nft-card';
            card.style.opacity = '0';
            card.style.transform = 'translateY(50px)';
            card.innerHTML = `
                <video class="nft-video lazy-video" loop muted playsinline preload="metadata" data-src="${nft.video}">
                    <source data-src="${nft.video}" type="video/mp4">
                    Your browser does not support the video tag.
                </video>
                <div class="nft-info">
                    <h3>${nft.name}</h3>
                    <p>${nft.description}</p>
                    <p><strong>Price: 10 EURC</strong></p>
                    <button class="mint-btn" onclick="mintNFT(${nft.id})" id="mintBtn${nft.id}">Mint NFT</button>
                    <p class="mint-count" id="mintCount${nft.id}">Minted: 0/1000</p>
                    <div class="type-progress"><div class="type-fill" id="typeFill${nft.id}"></div></div>
                </div>
            `;
            grid.appendChild(card);

            // Smooth Animation Load with IntersectionObserver
            const observer = new IntersectionObserver(entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const video = entry.target.querySelector('.lazy-video');
                        video.src = nft.video;
                        video.querySelector('source').src = nft.video;
                        video.load();
                        // Start loop animation on load (no user interaction needed)
                        video.addEventListener('loadeddata', () => {
                            video.play().catch(() => {}); // Silent fail if blocked
                            card.style.opacity = '1';
                            card.style.transform = 'translateY(0)';
                            card.style.transition = `all 0.8s ease ${index * 0.1}s`; // Staggered animation
                        });
                        // Hover to restart loop for fresh animation feel
                        video.addEventListener('mouseenter', () => video.currentTime = 0);
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.2, rootMargin: '50px' });

            observer.observe(card);
        });
    }, 800); // Slightly longer delay for dramatic skeleton fade
}

// Wallet Functions (same as before)
async function connectWallet() {
    try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        userAddress = (await web3.eth.getAccounts())[0];
        await switchToArcNetwork();
        await updateWalletInfo();
        await updateBalances();
        await updateMintCounts();
        document.getElementById('connectWallet').style.display = 'none';
        document.getElementById('disconnectWallet').style.display = 'inline-block';
        showMessage('Wallet connected! Ready to mint on Arc.', 'success');
    } catch (e) { showMessage('Connection failed: ' + e.message, 'error'); }
}

async function switchToArcNetwork() {
    try {
        await window.ethereum.request({ 
            method: 'wallet_switchEthereumChain', 
            params: [{ chainId: web3.utils.toHex(CHAIN_ID) }] 
        });
    } catch (e) {
        if (e.code === 4902) {
            await window.ethereum.request({ 
                method: 'wallet_addEthereumChain', 
                params: [{
                    chainId: web3.utils.toHex(CHAIN_ID),
                    chainName: 'Arc Testnet',
                    rpcUrls: [ARC_RPC],
                    nativeCurrency: { name: 'USDC', symbol: 'USDC', decimals: 18 },
                    blockExplorerUrls: ['https://testnet.arcscan.app/']
                }] 
            });
        } else {
            throw e;
        }
    }
}

function disconnectWallet() {
    userAddress = null;
    document.getElementById('connectWallet').style.display = 'inline-block';
    document.getElementById('disconnectWallet').style.display = 'none';
    document.getElementById('walletInfo').textContent = '';
    document.getElementById('eurcBalance').textContent = '0.00';
    showMessage('Wallet disconnected.', 'success');
}

async function updateWalletInfo() {
    if (userAddress) {
        const short = `${userAddress.slice(0,6)}...${userAddress.slice(-4)}`;
        document.getElementById('walletInfo').textContent = `Connected: ${short}`;
    }
}

async function updateBalances() {
    if (!userAddress || !eurcContract) return;
    try {
        const bal = await eurcContract.methods.balanceOf(userAddress).call();
        document.getElementById('eurcBalance').textContent = (bal / 1e6).toFixed(2);
    } catch (e) { console.error('Balance update error:', e); }
}

async function updateMintCounts() {
    if (!nftContract) return;
    let total = 0;
    for (let i = 1; i <= 12; i++) {
        try {
            const minted = await nftContract.methods.getMintedCountPerType(i).call();
            const el = document.getElementById(`mintCount${i}`);
            const fill = document.getElementById(`typeFill${i}`);
            if (el && fill) {
                el.textContent = `Minted: ${minted}/1000`;
                fill.style.width = `${(minted / 1000) * 100}%`;
            }
            total += parseInt(minted);
        } catch (e) { console.error(`Count update error for ${i}:`, e); }
    }
    const mintedEl = document.getElementById('mintedCount');
    if (mintedEl) mintedEl.textContent = total;
    const progressEl = document.getElementById('progressFill');
    if (progressEl) progressEl.style.width = `${(total / 12000) * 100}%`;
}

// Mint Function
async function mintNFT(type) {
    if (!userAddress) return showMessage('Connect wallet first!', 'error');
    const btn = document.getElementById(`mintBtn${type}`);
    const originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Minting...';
    try {
        const bal = await eurcContract.methods.balanceOf(userAddress).call();
        if (parseInt(bal) < 10 * 1e6) throw new Error('Need at least 10 EURC');
        let allowance = await eurcContract.methods.allowance(userAddress, NFT_CONTRACT_ADDRESS).call();
        if (parseInt(allowance) < 10 * 1e6) await approveEURC();
        const tx = await nftContract.methods.mintNFT(type).send({ from: userAddress });
        showMessage(`🎉 NFT #${type} minted! Tx: ${tx.transactionHash.slice(0, 10)}...`, 'success');
        await updateBalances();
        await updateMintCounts();
    } catch (e) {
        showMessage('Mint failed: ' + e.message, 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = originalText;
    }
}

async function approveEURC() {
    const max = '115792089237316195423570985008687907853269984665640564039457584007913129639935';
    await eurcContract.methods.approve(NFT_CONTRACT_ADDRESS, max).send({ from: userAddress });
    showMessage('EURC approved! Now mint away.', 'success');
}

// Message System
function showMessage(msg, type) {
    const div = document.createElement('div');
    div.className = `${type}-message`;
    div.textContent = msg;
    document.body.appendChild(div);
    setTimeout(() => div.classList.add('show'), 100);
    setTimeout(() => {
        div.classList.remove('show');
        setTimeout(() => div.remove(), 300);
    }, 5000);
}

function handleAccountsChanged(accounts) {
    if (accounts.length === 0) disconnectWallet();
    else location.reload();
}
