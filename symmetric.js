const crypto = require("crypto");

// Encryption function
function encryptSymmetric(text, key) {
  const iv = crypto.randomBytes(16); // Generate a random initialization vector
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + encrypted;
}

// Decryption function
function decryptSymmetric(encrypted, key) {
  const iv = Buffer.from(encrypted.slice(0, 32), "hex"); // Extract the initialization vector from the encrypted text
  const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
  let decrypted = decipher.update(encrypted.slice(32), "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

module.exports = { encryptSymmetric, decryptSymmetric };
// // Example usage
// const plaintext = "Hello, world!";
// console.log("Plaintext:", plaintext);

// const ciphertext = encryptSymmetric(plaintext, key);
// console.log("Ciphertext:", ciphertext);

// const decryptedtext = decryptSymmetric(ciphertext, key);
// console.log("Decrypted text:", decryptedtext);
