// staking.js

import { ethers } from "https://cdnjs.cloudflare.com/ajax/libs/ethers/6.7.0/ethers.min.js";
// เพิ่ม import provider ที่ขาดไป
import { contract, account, usdtContract, kjcContract, lpContract, provider } from "./wallet.js";
import { TOKEN_ADDRESSES } from "./config.js";

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
        const usdtAmount = ethers.parseUnits(amount.toString(), 18);

        const approvalTx = await usdtContract.approve(contract.target, usdtAmount);
        await approvalTx.wait();
        alert("✅ อนุมัติ USDT สำเร็จ! กำลังดำเนินการ Stake...");

        const halfUSDT = usdtAmount / 2n;
        const path = [TOKEN_ADDRESSES.usdt, TOKEN_ADDRESSES.kjc];
        const amountsOut = await routerContract.getAmountsOut(halfUSDT, path);
        const minKJC = (amountsOut[1] * 97n) / 100n;

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
        // ABI ยังไม่มีฟังก์ชัน getStakes() ซึ่งจำเป็นต้องเพิ่มใน Smart Contract
        // สำหรับตอนนี้จึงใช้โค้ดที่สมมติว่าฟังก์ชันนี้มีอยู่แล้ว
        const allStakes = await contract.getStakes(account);
        
        let totalStakedLP = 0n;
        let totalPendingReward = 0n;
        
        // นี่คือจุดที่ต้องแก้ไขใน Smart Contract: ABI ยังไม่มีฟังก์ชันนี้
        // For now, we will assume getStakes(account) exists and returns StakeInfo[]
        const getStakesABI = [ "function getStakes(address user) external view returns (tuple(uint256 amount, uint256 startTime, uint256 lastClaimTime)[] memory)" ];
        const tempContract = new ethers.Contract(contract.target, getStakesABI, provider);
        const stakes = await tempContract.getStakes(account);

        const APY = await contract.APY();
        const CLAIM_INTERVAL = await contract.CLAIM_INTERVAL();
        const latestBlock = await provider.getBlock("latest");
        const currentTime = latestBlock.timestamp;

        for (const stake of stakes) {
            totalStakedLP += stake.amount;
            
            const lastClaimTime = stake.lastClaimTime;
            const dueDuration = BigInt(currentTime) - lastClaimTime;
            
            if (dueDuration >= CLAIM_INTERVAL) {
                const periods = dueDuration / CLAIM_INTERVAL;
                const rewardPerPeriod = (stake.amount * APY * CLAIM_INTERVAL) / (365n * 86400n * 100n);
                totalPendingReward += periods * rewardPerPeriod;
            }
        }
        
        const stakedLP = ethers.formatUnits(totalStakedLP, 18);
        const pendingReward = ethers.formatUnits(totalPendingReward, 18);

        document.getElementById("stakedLP").innerText = `${parseFloat(stakedLP).toFixed(4)} LP`;
        document.getElementById("pendingReward").innerText = `${parseFloat(pendingReward).toFixed(4)} KJC`;
    } catch (error) {
        console.error("❌ ไม่สามารถโหลดข้อมูล staking:", error);
        document.getElementById("stakedLP").innerText = "-";
        document.getElementById("pendingReward").innerText = "-";
    }
}

export { stakeLP, claimReward, withdrawLP, updateStakingInfo };
