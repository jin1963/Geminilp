// app.js

import { ethers } from "https://cdnjs.cloudflare.com/ajax/libs/ethers/6.7.0/ethers.min.js";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "./config.js";

let provider;
let signer;
let contract;
let account;

// ฟังก์ชันเริ่มต้นการเชื่อมต่อ
async function init() {
    // ตรวจสอบว่า MetaMask หรือ wallet อื่นๆ ได้ติดตั้งหรือยัง
    if (typeof window.ethereum !== "undefined") {
        try {
            provider = new ethers.BrowserProvider(window.ethereum);
            await provider.send("eth_requestAccounts", []);
            signer = await provider.getSigner();
            account = await signer.getAddress();
            contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

            console.log("✅ เชื่อมต่อกระเป๋าสำเร็จ:", account);

            // เมื่อเชื่อมต่อสำเร็จ ให้เรียกฟังก์ชันหลักของแอป
            initApp();
        } catch (error) {
            console.error("❌ เกิดข้อผิดพลาดในการเชื่อมต่อ:", error);
            alert("โปรดเชื่อมต่อกระเป๋า MetaMask เพื่อใช้งานแอปพลิเคชัน");
        }
    } else {
        alert("โปรดติดตั้ง MetaMask เพื่อใช้งาน");
    }
}

// ฟังก์ชันหลักของแอปพลิเคชัน
async function initApp() {
    if (!account) return;

    // โหลดข้อมูล staking (ฟังก์ชันนี้จะเขียนใน staking.js)
    await updateStakingInfo();

    // โหลดข้อมูล referral
    await updateReferralInfo();

    // สร้างลิงก์แนะนำ
    const currentUrl = window.location.origin + window.location.pathname;
    const referralLink = `${currentUrl}?ref=${account}`;
    const refLinkElement = document.getElementById("refLink");
    if (refLinkElement) {
        refLinkElement.href = referralLink;
        refLinkElement.innerText = referralLink;
    }
}

// ฟังก์ชันโหลดข้อมูลรางวัล referral
async function updateReferralInfo() {
    try {
        // ดึงข้อมูล users struct และเข้าถึง referralRewards
        const userInfo = await contract.users(account);
        const referralRewards = userInfo[1]; // users struct: (referrer, referralRewards)
        const formatted = ethers.formatUnits(referralRewards, 18); // KJC decimal is 18

        const refRewardElement = document.getElementById("refReward");
        if (refRewardElement) {
            refRewardElement.innerText = parseFloat(formatted).toFixed(4);
        }

        console.log("✅ โหลดข้อมูล referral reward สำเร็จ:", formatted);
    } catch (err) {
        console.error("❌ ไม่สามารถโหลดข้อมูล referral:", err);
    }
}

// เรียกฟังก์ชัน init เมื่อหน้าเว็บโหลดเสร็จ
window.onload = init;

// Export ค่าที่จำเป็นเพื่อให้ไฟล์อื่นใช้งานได้
export { provider, signer, contract, account, initApp };
