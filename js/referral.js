// referral.js

import { ethers } from "https://cdnjs.cloudflare.com/ajax/libs/ethers/6.7.0/ethers.min.js";
import { contract, account } from "./wallet.js";
// แก้ไข import ที่ผิดพลาด
import { updateReferralInfo } from "./app.js";

async function registerReferrer() {
    if (!contract || !account) {
        alert("กรุณาเชื่อมต่อกระเป๋าก่อน");
        return;
    }

    const refAddress = document.getElementById("refAddress").value.trim();

    if (!ethers.isAddress(refAddress)) {
        alert("❌ กรุณากรอก Referrer Address ให้ถูกต้อง");
        return;
    }

    try {
        const tx = await contract.setReferrer(refAddress);
        await tx.wait();

        alert("✅ สมัครสำเร็จ!");
    } catch (error) {
        console.error("❌ การสมัคร Referrer ผิดพลาด:", error);
        alert("❌ สมัครไม่สำเร็จ อาจจะเคยมี Referrer แล้วหรือเกิดข้อผิดพลาดอื่น ๆ");
    }
}

async function claimReferral() {
    if (!contract || !account) {
        alert("กรุณาเชื่อมต่อกระเป๋าก่อน");
        return;
    }

    try {
        const tx = await contract.claimReferralReward();
        await tx.wait();

        alert("✅ เคลมรางวัลแนะนำสำเร็จแล้ว!");
        await updateReferralInfo();
    } catch (error) {
        console.error("❌ Claim ผิดพลาด:", error);
        alert("❌ ไม่สามารถเคลมรางวัลแนะนำได้ อาจจะยังไม่มีรางวัลให้เคลม");
    }
}

export { registerReferrer, claimReferral };
