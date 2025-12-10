const { ethers } = require("ethers");
const crypto = require("crypto");
const logger = require("../config/logger");

const RPC_URL = process.env.BLOCKCHAIN_RPC_URL;
const PRIVATE_KEY = process.env.BLOCKCHAIN_PRIVATE_KEY;

const fs = require("fs");

function calculateFileHash(filePath) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash("sha256");
    const stream = fs.createReadStream(filePath);

    stream.on("data", (data) => hash.update(data));
    stream.on("end", () => resolve(hash.digest("hex")));
    stream.on("error", (err) => reject(err));
  });
}

let provider = null;
let wallet = null;

function getBlockchainWallet() {
  if (!PRIVATE_KEY) {
    logger.warn("Blockchain Private Key not configured.");
    return null;
  }

  if (wallet) return wallet;

  if (!RPC_URL) {
    throw new Error("BLOCKCHAIN_RPC_URL is not configured.");
  }

  if (!provider) {
    provider = new ethers.JsonRpcProvider(RPC_URL);
  }

  wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  return wallet;
}

async function notarizeBook(fileHash) {
  try {
    const walletInstance = getBlockchainWallet();
    if (!walletInstance) return null;

    const tx = {
      to: walletInstance.address,
      value: 0,
      data: "0x" + fileHash,
    };

    logger.info("Initiating blockchain notarization...");

    const transactionResponse = await walletInstance.sendTransaction(tx);

    logger.info(
      { txHash: transactionResponse.hash },
      "Blockchain notarization initiated (Async)."
    );

    return transactionResponse.hash;
  } catch (error) {
    logger.error(error, "Blockchain Notarization Failed");
    return null;
  }
}

async function retryNotarizations(books) {
  const results = [];
  const walletInstance = getBlockchainWallet();

  if (!walletInstance) {
    return books.map((b) => ({ id: b.id, error: "No Wallet Configured" }));
  }

  for (const book of books) {
    try {
      const txHash = await notarizeBook(book.file_hash);
      results.push({ id: book.id, txHash });
    } catch (err) {
      results.push({ id: book.id, error: err.message });
    }
  }
  return results;
}

module.exports = {
  calculateFileHash,
  notarizeBook,
  retryNotarizations,
};
