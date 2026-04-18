// calculator.js

// Validates input: strictly 1 to 2 hexadecimal characters
function isValidHex(hex) {
    const hexRegex = /^[0-9A-Fa-f]{1,2}$/;
    return hexRegex.test(hex);
}

// Converts Hex to Decimal for math operations
function hexToDec(hex) {
    if (!isValidHex(hex)) {
        throw new Error("Invalid input: Must be 1 or 2 hex digits.");
    }
    return parseInt(hex, 16);
}

// Converts Decimal back to Hex and enforces output rules
function decToHex(dec) {
    if (dec < 0) {
        throw new Error("Output cannot be negative.");
    }
    if (dec > 65535) { // 65535 in decimal is FFFF in hex
        throw new Error("Output exceeds 4 hex digits."); 
    }
    return dec.toString(16).toUpperCase();
}

// --- Arithmetic Operations ---

function add(a, b) {
    const sum = hexToDec(a) + hexToDec(b);
    return decToHex(sum);
}

function subtract(a, b) {
    const diff = hexToDec(a) - hexToDec(b);
    return decToHex(diff);
}

function multiply(a, b) {
    const product = hexToDec(a) * hexToDec(b);
    return decToHex(product);
}

function divide(a, b) {
    const divisor = hexToDec(b);
    if (divisor === 0) {
        throw new Error("Cannot divide by zero.");
    }
    // Math.floor enforces the "no decimals" rule by rounding down remainders
    const quotient = Math.floor(hexToDec(a) / divisor);
    return decToHex(quotient);
}

// Export the functions so our testing file can read them
module.exports = { add, subtract, multiply, divide };