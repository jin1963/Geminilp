// staking.js

import { ethers } from "https://cdnjs.cloudflare.com/ajax/libs/ethers/6.7.0/ethers.min.js";
import { contract, account, usdtContract, kjcContract, lpContract } from "./wallet.js";
import { TOKEN_ADDRESSES } from "./config.js";

// ABI เฉพาะสำหรับ Router เพื่อใช้ในการ getAmountsOut
const routerAbi = [
    "function getAmountsOut(uint amountIn, address[] calldata path) external view returns (uint[] memory amounts)"
];
const routerContract = new ethers.Contract(TOKEN_ADDRESSES.router, routerAbi, provider);

async function stakeLP(amount) {
    if (!contract || !account) {
        alert("กรุณาเชื่อมต่อกระเป๋าก่อน");
        return;
    }

    try {
        const usdtAmount = ethers.parseUnits(amount.toString(), 18); // USDT decimals = 18

        // 1. Approve USDT ให้ contract ใช้
        const approvalTx = await usdtContract.approve(contract.target, usdtAmount);
        await approvalTx.wait();
        alert("✅ อนุมัติ USDT สำเร็จ! กำลังดำเนินการ Stake...");

        // 2. คำนวณ minKJC output ที่จะ swap จากครึ่งของ USDT -> KJC (slippage 3%)
        const halfUSDT = usdtAmount / 2n;
        const path = [TOKEN_ADDRESSES.usdt, TOKEN_ADDRESSES.kjc];
        const amountsOut = await routerContract.getAmountsOut(halfUSDT, path);
        const minKJC = (amountsOut[1] * 97n) / 100n; // -3% slippage

        // 3. Call buyAndStake
        const stakeTx = await contract.buyAndStake(usdtAmount, minKJC);
        await stakeTx.wait();

        alert("✅ สเตคสำเร็จ! ระบบได้เพิ่ม LP และล็อกไว้เรียบร้อยแล้ว");
        await updateStakingInfo();
    } catch (error) {
        console.error("❌ ผิดพลาดตอน stake:", error);
        alert("❌ ไม่สามารถ stake ได้ กรุณาตรวจสอบจำนวนหรือรอสักครู่");
    }
}

async function claimReward() {
    if (!contract || !account) {
        alert("กรุณาเชื่อมต่อกระเป๋าก่อน");
        return;
    }

    try {
        const claimTx = await contract.claimStakingReward();
        await claimTx.wait();
        alert("✅ เคลมรางวัลสำเร็จแล้ว!");
        await updateStakingInfo();
    } catch (error) {
        console.error("❌ Claim ผิดพลาด:", error);
        alert("❌ ไม่สามารถเคลมรางวัลได้ อาจจะยังไม่มีรางวัลให้เคลม");
    }
}

async function withdrawLP() {
    if (!contract || !account) {
        alert("กรุณาเชื่อมต่อกระเป๋าก่อน");
        return;
    }

    try {
        const withdrawTx = await contract.withdrawLP();
        await withdrawTx.wait();
        alert("✅ ถอน LP สำเร็จแล้ว");
        await updateStakingInfo();
    } catch (error) {
        console.error("❌ Withdraw ผิดพลาด:", error);
        alert("❌ ไม่สามารถถอน LP ได้ อาจจะยังไม่ครบระยะเวลาล็อก");
    }
}

async function updateStakingInfo() {
    if (!contract || !account) return;

    try {
        // ABI ของเราไม่มีฟังก์ชัน stakers(account) และ getPendingReward(account)
        // ต้องดึงข้อมูลจาก users(account) และวนลูปคำนวณ pending reward เอง
        const userInfo = await contract.users(account);
        const stakes = userInfo.stakes; // นี่คือจุดที่ต้องมีฟังก์ชัน getStakes ใน Smart Contract
        
        let totalStakedLP = 0n;
        let totalPendingReward = 0n;
        
        // นี่คือจุดที่ต้องแก้ไขใน Smart Contract: ABI ยังไม่มีฟังก์ชันนี้
        // For now, we will assume getStakes(account) exists and returns StakeInfo[]
        const allStakes = await contract.getStakes(account);
        
        for (const stake of allStakes) {
            totalStakedLP += stake.amount;
            
            const lastClaimTime = stake.lastClaimTime;
            const APY = await contract.APY();
            const CLAIM_INTERVAL = await contract.CLAIM_INTERVAL();
            
            const currentTime = await provider.getBlock("latest").timestamp;
            const dueDuration = BigInt(currentTime) - lastClaimTime;
            
            if (dueDuration >= CLAIM_INTERVAL) {
                const periods = dueDuration / CLAIM_INTERVAL;
                const rewardPerPeriod = (stake.amount * APY * CLAIM_INTERVAL) / (365n * 86400n * 100n);
                totalPendingReward += periods * rewardPerPeriod;
            }
        }
        
        const stakedLP = ethers.formatUnits(totalStakedLP, 18); // Assuming LP token has 18 decimals
        const pendingReward = ethers.formatUnits(totalPendingReward, 18); // Assuming KJC has 18 decimals

        document.getElementById("stakedLP").innerText = `${parseFloat(stakedLP).toFixed(4)} LP`;
        document.getElementById("pendingReward").innerText = `${parseFloat(pendingReward).toFixed(4)} KJC`;
    } catch (error) {
        console.error("❌ ไม่สามารถโหลดข้อมูล staking:", error);
        document.getElementById("stakedLP").innerText = "-";
        document.getElementById("pendingReward").innerText = "-";
    }
}

export { stakeLP, claimReward, withdrawLP, updateStakingInfo };
