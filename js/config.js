// config.js
// This file contains all necessary configuration for interacting with the smart contract.

const CONTRACT_ADDRESS = "0xf24bb50d20b64329290D2144016Bf13b5f901710";

const CONTRACT_ABI = [
    {
        "inputs": [
            { "internalType": "address", "name": "_usdt", "type": "address" },
            { "internalType": "address", "name": "_kjc", "type": "address" },
            { "internalType": "address", "name": "_lpToken", "type": "address" },
            { "internalType": "address", "name": "_router", "type": "address" }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "anonymous": false,
        "inputs": [
            { "indexed": true, "internalType": "address", "name": "user", "type": "address" },
            { "indexed": false, "internalType": "uint256", "name": "lpAmount", "type": "uint256" }
        ],
        "name": "LPWithdrawn",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }
        ],
        "name": "OwnerKJCWithdrawal",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            { "indexed": true, "internalType": "address", "name": "user", "type": "address" },
            { "indexed": false, "internalType": "uint256", "name": "rewardAmount", "type": "uint256" }
        ],
        "name": "ReferralRewardClaimed",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            { "indexed": true, "internalType": "address", "name": "user", "type": "address" },
            { "indexed": false, "internalType": "uint256", "name": "liquidityAmount", "type": "uint256" },
            { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }
        ],
        "name": "Staked",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            { "indexed": true, "internalType": "address", "name": "user", "type": "address" },
            { "indexed": false, "internalType": "uint256", "name": "rewardAmount", "type": "uint256" }
        ],
        "name": "StakingRewardClaimed",
        "type": "event"
    },
    {
        "inputs": [],
        "name": "APY",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "CLAIM_INTERVAL",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "LOCK_DURATION",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "name": "REF_PERCENT",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "uint256", "name": "usdtAmount", "type": "uint256" },
            { "internalType": "uint256", "name": "minKJC", "type": "uint256" }
        ],
        "name": "buyAndStake",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "claimReferralReward",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "claimStakingReward",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "kjc",
        "outputs": [{ "internalType": "contract IERC20", "name": "", "type": "address" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "lpToken",
        "outputs": [{ "internalType": "contract IERC20", "name": "", "type": "address" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "owner",
        "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "router",
        "outputs": [{ "internalType": "contract IPancakeRouter", "name": "", "type": "address" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "address", "name": "ref", "type": "address" }],
        "name": "setReferrer",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "usdt",
        "outputs": [{ "internalType": "contract IERC20", "name": "", "type": "address" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "address", "name": "", "type": "address" }],
        "name": "users",
        "outputs": [{ "internalType": "address", "name": "referrer", "type": "address" }, { "internalType": "uint256", "name": "referralRewards", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "withdrawLP",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "uint256", "name": "amount", "type": "uint256" }],
        "name": "withdrawRemainingKJC",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
];

const TOKEN_ADDRESSES = {
    usdt: "0x55d398326f99059fF775485246999027B3197955",
    kjc: "0xd479ae350dc24168e8db863c5413c35fb2044ecd",
    lpToken: "0xdF0d76046E72C183142c5208Ea0247450475A0DF",
    router: "0x10ED43C718714eb63d5aA57B78B54704E256024E"
};

export { CONTRACT_ADDRESS, CONTRACT_ABI, TOKEN_ADDRESSES };
