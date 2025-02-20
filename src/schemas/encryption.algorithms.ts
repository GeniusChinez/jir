import { z } from "zod";

export const encryptionAlgorithms = [
  // **Symmetric Encryption (Fast & Secure)**
  "AES-128",
  "AES-192",
  "AES-256",
  "ChaCha20",
  "Camellia-128",
  "Camellia-192",
  "Camellia-256",

  // **Asymmetric Encryption (Public-Key Encryption)**
  "RSA-2048",
  "RSA-3072",
  "RSA-4096",
  "X25519",
  "Ed25519",
  "ECC",
  "ECDH",
  "ECDSA",

  // **Post-Quantum Cryptography (Future-Proof)**
  "Kyber",
  "Dilithium",
  "NTRUEncrypt",

  // **Key Exchange Algorithms**
  "Diffie-Hellman",
  "ECDH",

  // **Legacy (Still Used but Not Recommended for New Systems)**
  "3DES",
  "Blowfish",
  "Twofish",
  "Serpent",
] as const;

export const EncryptionAlgorithmSchema = z.enum(encryptionAlgorithms);
