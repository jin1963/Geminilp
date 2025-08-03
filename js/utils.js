// utils.js

import { ethers } from "https://cdnjs.cloudflare.com/ajax/libs/ethers/6.7.0/ethers.min.js";

/**
 * ตัดทศนิยมของตัวเลข โดยไม่ปัดขึ้นถ้าไม่จำเป็น
 * @param {number | string} value - ตัวเลขที่ต้องการตัดทศนิยม
 * @param {number} dp - จำนวนตำแหน่งทศนิยมที่ต้องการ
 * @returns {number} - ตัวเลขที่ถูกตัดทศนิยมแล้ว
 */
function toFixedIfNecessary(value, dp) {
  const num = parseFloat(value);
  if (isNaN(num)) return 0;
  return +num.toFixed(dp);
}

/**
 * ตัด Address ให้สั้นลงเพื่อความสวยงาม
 * @param {string} addr - Address ที่ต้องการตัด
 * @returns {string} - Address แบบย่อ
 */
function shortenAddress(addr) {
  if (!addr || addr.length !== 42) return addr;
  return `${addr.substring(0, 6)}...${addr.substring(38)}`;
}

/**
 * ดึง Referrer Address จาก URL
 * @returns {string | null} - Referrer Address หรือ null ถ้าไม่พบ
 */
function getReferrerFromURL() {
  const params = new URLSearchParams(window.location.search);
  const ref = params.get("ref");
  // ตรวจสอบรูปแบบ Address ด้วย ethers.isAddress()
  return (ref && ethers.isAddress(ref)) ? ref : null;
}

export { toFixedIfNecessary, shortenAddress, getReferrerFromURL };
