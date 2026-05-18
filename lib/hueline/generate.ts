const ALPHABET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';

export function generateHuelineId(length = 6): string {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += ALPHABET.charAt(Math.floor(Math.random() * ALPHABET.length));
  }
  return `HL-${result}`;
}

export function generatePin(length = 4): string {
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;
  return String(Math.floor(Math.random() * (max - min + 1)) + min);
}