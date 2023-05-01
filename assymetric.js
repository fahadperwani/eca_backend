const crypto = require("crypto");

// // Encryption function using private key
function encryptWithPrivateKey(message, privateKey) {
  const buffer = Buffer.from(message);
  const encrypted = crypto.privateEncrypt(privateKey, buffer);
  return encrypted.toString("base64");
}

// Decryption function using public key
function decryptWithPublicKey(encryptedMessage, publicKey) {
  const buffer = Buffer.from(encryptedMessage, "base64");
  const decrypted = crypto.publicDecrypt(publicKey, buffer);
  return decrypted.toString("utf8");
}

function encrypt(message, publicKey) {
  const buffer = Buffer.from(message);
  const encrypted = crypto.publicEncrypt(publicKey, buffer);
  return encrypted.toString("base64");
}

// Decryption function
function decrypt(encryptedMessage, privateKey) {
  const buffer = Buffer.from(encryptedMessage, "base64");
  const decrypted = crypto.privateDecrypt(privateKey, buffer);
  return decrypted.toString("utf8");
}

module.exports = {
  encrypt,
  encryptWithPrivateKey,
  decrypt,
  decryptWithPublicKey,
};
