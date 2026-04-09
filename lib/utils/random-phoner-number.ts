export function generateRandomPhoneNumber() {
    const newNumberPart1 = "+1437000" 
    const newNumberPart2 = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
    return newNumberPart1 + newNumberPart2
}