import { customAlphabet } from 'nanoid';

// 1. Define readable characters (No 0, O, I, L, 1)
const alphabet = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';

// 2. Generate 6-char ID (e.g., "9X2M4P")
const generateId = customAlphabet(alphabet, 6); 

export function generateHuelineId() {
  return `HL-${generateId()}`; // Result: "HL-9X2M4P"
}

// Simple 4-digit PIN generator
export function generatePin() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}