// calculator.test.js

const { add, subtract, multiply, divide } = require('./calculator');

describe('Input and Output Limitations', () => {
    test('Throws error if input is more than 2 digits', () => {
        expect(() => add("FFF", "1")).toThrow("Invalid input: Must be 1 or 2 hex digits.");
    });

    test('Throws error if input contains non-hex characters', () => {
        expect(() => add("G1", "1")).toThrow("Invalid input: Must be 1 or 2 hex digits.");
    });

    test('Ensures output does not exceed 4 hex digits (max FF * FF = FE01)', () => {
        expect(multiply("FF", "FF")).toBe("FE01");
    });
});

describe('Hexadecimal Addition', () => {
    test('Adds two hex numbers correctly (A + 5 = F)', () => {
        expect(add("A", "5")).toBe("F");
    });

    test('Adds two hex numbers that carry over (F + 1 = 10)', () => {
        expect(add("F", "1")).toBe("10");
    });
});

describe('Hexadecimal Subtraction', () => {
    test('Subtracts two hex numbers correctly (F - 5 = A)', () => {
        expect(subtract("F", "5")).toBe("A");
    });

    test('Throws error if subtraction results in a negative number', () => {
        expect(() => subtract("5", "A")).toThrow("Output cannot be negative.");
    });
});

describe('Hexadecimal Multiplication', () => {
    test('Multiplies two hex numbers correctly (A * 2 = 14)', () => {
        expect(multiply("A", "2")).toBe("14");
    });
});

describe('Hexadecimal Division', () => {
    test('Divides two hex numbers correctly (14 / 2 = A)', () => {
        expect(divide("14", "2")).toBe("A");
    });

    test('Floors the result to enforce no decimals (F / 2 = 7, remainder dropped)', () => {
        expect(divide("F", "2")).toBe("7"); 
    });

    test('Throws error when dividing by zero', () => {
        expect(() => divide("A", "0")).toThrow("Cannot divide by zero.");
    });
});