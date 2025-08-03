// wallet.js

import { ethers } from "https://cdnjs.cloudflare.com/ajax/libs/ethers/6.7.0/ethers.min.js";
import { CONTRACT_ADDRESS, CONTRACT_ABI, TOKEN_ADDRESSES } from "./config.js";
import { initApp } from "./app.js";

let provider;
let signer;
let contract;
let account;
let isConnecting = false;

// BNB Smart Chain Mainnet Chain ID
const BSC_CHAIN_ID = "0x38";

// Contract Instances
let usdtContract;
let kjcContract;
let lpContract;

const erc20Abi = [
    "function approve(address spender, uint256 amount) external returns (bool)",
    "function balanceOf(address account) external view returns (uint256)",
    "function transferFrom(address from, address to, uint256 amount) external returns (bool)"
];

async function connectWallet() {
    if (isConnecting) return;
    isConnecting = true;

    // ตรวจสอบว่ามี wallet extension ที่รองรับหรือไม่
    if (typeof window.ethereum === "undefined") {
        alert("⚠️ กรุณาติดตั้ง MetaMask หรือ Bitget Wallet");
        isConnecting = false;
        return;
    }

    try {
        // ขอให้ผู้ใช้เชื่อมต่อกระเป๋า
        provider = new ethers.BrowserProvider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        signer = await provider.getSigner();
        account = await signer.getAddress();

        // ตรวจสอบและสลับ chain ไปยัง BSC
        const network = await provider.getNetwork();
        if (network.chainId !== BigInt(BSC_CHAIN_ID)) {
            try {
                await window.ethereum.request({
                    method: "wallet_switchEthereumChain",
                    params: [{ chainId: BSC_CHAIN_ID }],
                });
                // หลังจากสลับ chain ให้รีโหลด provider และ signer
                provider = new ethers.BrowserProvider(window.ethereum);
                signer = await provider.getSigner();
            } catch (switchError) {
                if (switchError.code === 4902) {
                    await window.ethereum.request({
                        method: "wallet_addEthereumChain",
                        params: [{
                            chainId: BSC_CHAIN_ID,
                            chainName: "BNB Smart Chain",
                            nativeCurrency: { name: "BNB", symbol: "BNB", decimals: 18 },
                            rpcUrls: ["https://bsc-dataseed.binance.org/"],
                            blockExplorerUrls: ["https://bscscan.com"]
                        }]
                    });
                    // หลังจากเพิ่ม chain ให้รีโหลด provider และ signer
                    provider = new ethers.BrowserProvider(window.ethereum);
                    signer = await provider.getSigner();
                } else {
                    throw switchError;
                }
            }
        }

        // ✅ สร้าง Contract Instance
        contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
        usdtContract = new ethers.Contract(TOKEN_ADDRESSES.usdt, erc20Abi, signer);
        kjcContract = new ethers.Contract(TOKEN_ADDRESSES.kjc, erc20Abi, signer);
        lpContract = new ethers.Contract(TOKEN_ADDRESSES.lpToken, erc20Abi, signer);

        // ✅ อัปเดต UI และโหลดข้อมูล
        document.getElementById("walletAddress").innerText = `✅ ${account.substring(0, 6)}...${account.substring(38)}`;
        document.getElementById("status").innerText = "สถานะ: เชื่อมต่อแล้ว";
        document.getElementById("status").className = "connected";

        // โหลดข้อมูล staking/referral
        await initApp();

        console.log("✅ เชื่อมต่อกระเป๋าสำเร็จ:", account);

    } catch (err) {
        console.error("⚠️ Wallet connect error:", err);
        document.getElementById("walletAddress").innerText = "❌ การเชื่อมต่อล้มเหลว";
        document.getElementById("status").innerText = "สถานะ: ไม่ได้เชื่อมต่อ";
        document.getElementById("status").className = "disconnected";
        alert("❌ ไม่สามารถเชื่อมต่อกระเป๋าได้");
    }

    isConnecting = false;
}

export { connectWallet, provider, signer, account, contract, usdtContract, kjcContract, lpContract };
