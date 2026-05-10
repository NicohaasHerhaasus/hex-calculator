/**
 * calculator.gui.test.js
 *
 * GUI tests for the Hex Calculator front end.
 * Uses jsdom (built into Jest's default test environment) to simulate
 * a real browser DOM without opening a browser.
 *
 * Run with:  npx jest calculator.gui.test.js
 */

const fs   = require('fs');
const path = require('path');

// ─── Load the HTML file into jsdom ───────────────────────────────────────────
// Jest's default testEnvironment is 'node'; we override per-file with a docblock.
// @jest-environment jsdom

beforeEach(() => {
  // Read both files
  let html = fs.readFileSync(path.join(__dirname, 'calculator.html'), 'utf8');
  const calcJs = fs.readFileSync(path.join(__dirname, 'calculator.js'), 'utf8');

  // Replace the external <script src="calculator.js"> with an inline version.
  // jsdom cannot resolve local file:// src paths, so we inline it instead.
  html = html.replace(
    '<script src="calculator.js"></script>',
    `<script>${calcJs}</script>`
  );

  document.open();
  document.write(html);
  document.close();
});

// ─── Helper: simulate a button click by its id ───────────────────────────────
function clickBtn(id) {
  const btn = document.getElementById(id);
  if (!btn) throw new Error(`Button #${id} not found in DOM`);
  btn.click();
  return btn;
}

// ─── Helper: read the current display text ───────────────────────────────────
function getDisplay() {
  // The cursor <span> sits inside the display; exclude it from the text
  const el = document.getElementById('display');
  return el.childNodes[0]?.textContent?.trim() ?? el.textContent.trim();
}

function getExpression() {
  return document.getElementById('expression').textContent.trim();
}

function getDecimal() {
  return document.getElementById('decimal').textContent.trim();
}

// ─── 1. Rendering & Initial State ────────────────────────────────────────────
describe('Initial render', () => {
  test('display shows "0" on load', () => {
    expect(getDisplay()).toBe('0');
  });

  test('expression area is blank on load', () => {
    // Non-breaking space or empty
    expect(getExpression()).toMatch(/^\s*$/);
  });

  test('decimal readout shows DEC: 0 on load', () => {
    expect(getDecimal()).toBe('DEC: 0');
  });

  test('all 16 hex digit buttons are present (0-9, A-F)', () => {
    const digits = ['0','1','2','3','4','5','6','7','8','9','A','B','C','D','E','F'];
    digits.forEach(d => {
      expect(document.getElementById(`btn-${d}`)).not.toBeNull();
    });
  });

  test('all four operator buttons are present', () => {
    ['add','sub','mul','div'].forEach(op => {
      expect(document.getElementById(`btn-${op}`)).not.toBeNull();
    });
  });

  test('equals button is present', () => {
    expect(document.getElementById('btn-eq')).not.toBeNull();
  });

  test('clear button is present', () => {
    expect(document.getElementById('btn-AC')).not.toBeNull();
  });

  test('backspace button is present', () => {
    expect(document.getElementById('btn-BS')).not.toBeNull();
  });
});

// ─── 2. Digit Input ──────────────────────────────────────────────────────────
describe('Digit input', () => {
  test('clicking digit A shows A on display', () => {
    clickBtn('btn-A');
    expect(getDisplay()).toBe('A');
  });

  test('clicking 1 then F shows 1F on display', () => {
    clickBtn('btn-1');
    clickBtn('btn-F');
    expect(getDisplay()).toBe('1F');
  });

  test('clicking 00 from blank state shows 0 (leading zeros stripped)', () => {
    // inputDigit strips leading zeros, so "00" normalises to "0".
    // The 00 button is a shortcut for entering double-zero mid-number in
    // other calculators; here it safely resolves to "0" from a blank state.
    clickBtn('btn-00');
    expect(getDisplay()).toBe('0');
  });

  test('decimal readout updates when a valid digit is entered', () => {
    clickBtn('btn-A'); // A hex = 10 dec
    expect(getDecimal()).toBe('DEC: 10');
  });

  test('entering more than 2 digits is blocked (display unchanged)', () => {
    clickBtn('btn-1');
    clickBtn('btn-F');
    clickBtn('btn-F'); // third digit — should be rejected
    // The GUI shows a flash error or the original value — either way,
    // a third hex digit must NOT have been appended (no 3-char hex string).
    const shown = getDisplay();
    expect(shown).not.toMatch(/^[0-9A-Fa-f]{3,}$/);
  });
});

// ─── 3. Clear Button ─────────────────────────────────────────────────────────
describe('Clear (CLR) button', () => {
  test('CLR resets display to 0', () => {
    clickBtn('btn-A');
    clickBtn('btn-AC');
    expect(getDisplay()).toBe('0');
  });

  test('CLR resets expression area', () => {
    clickBtn('btn-A');
    clickBtn('btn-add');
    clickBtn('btn-AC');
    expect(getExpression()).toMatch(/^\s*$/);
  });

  test('CLR resets decimal readout to DEC: 0', () => {
    clickBtn('btn-F');
    clickBtn('btn-AC');
    expect(getDecimal()).toBe('DEC: 0');
  });
});

// ─── 4. Backspace Button ─────────────────────────────────────────────────────
describe('Backspace (⌫) button', () => {
  test('removes the last digit (1F → 1)', () => {
    clickBtn('btn-1');
    clickBtn('btn-F');
    clickBtn('btn-BS');
    expect(getDisplay()).toBe('1');
  });

  test('backspacing the only digit shows 0', () => {
    clickBtn('btn-A');
    clickBtn('btn-BS');
    expect(getDisplay()).toBe('0');
  });
});

// ─── 5. Operator Buttons ─────────────────────────────────────────────────────
describe('Operator selection', () => {
  test('pressing + updates expression to show operand and operator', () => {
    clickBtn('btn-A');
    clickBtn('btn-add');
    expect(getExpression()).toContain('A');
    expect(getExpression()).toContain('+');
  });

  test('pressing − updates expression', () => {
    clickBtn('btn-F');
    clickBtn('btn-sub');
    expect(getExpression()).toContain('F');
    expect(getExpression()).toContain('−');
  });

  test('pressing × updates expression', () => {
    clickBtn('btn-5');
    clickBtn('btn-mul');
    expect(getExpression()).toContain('×');
  });

  test('pressing ÷ updates expression', () => {
    clickBtn('btn-8');
    clickBtn('btn-div');
    expect(getExpression()).toContain('÷');
  });
});

// ─── 6. Equals / Calculation ─────────────────────────────────────────────────
describe('Equals button — calculations', () => {
  function calc(a, opId, b) {
    a.split('').forEach(c => clickBtn(`btn-${c}`));
    clickBtn(opId);
    b.split('').forEach(c => clickBtn(`btn-${c}`));
    clickBtn('btn-eq');
    return getDisplay();
  }

  test('A + 5 = F', () => {
    expect(calc('A', 'btn-add', '5')).toBe('F');
  });

  test('F + 1 = 10  (hex carry)', () => {
    expect(calc('F', 'btn-add', '1')).toBe('10');
  });

  test('F − 5 = A', () => {
    expect(calc('F', 'btn-sub', '5')).toBe('A');
  });

  test('A × 2 = 14', () => {
    expect(calc('A', 'btn-mul', '2')).toBe('14');
  });

  test('14 ÷ 2 = A', () => {
    expect(calc('14', 'btn-div', '2')).toBe('A');
  });

  test('F ÷ 2 = 7  (integer division, remainder dropped)', () => {
    expect(calc('F', 'btn-div', '2')).toBe('7');
  });

  test('expression area shows full equation after equals', () => {
    'A'.split('').forEach(c => clickBtn(`btn-${c}`));
    clickBtn('btn-add');
    '5'.split('').forEach(c => clickBtn(`btn-${c}`));
    clickBtn('btn-eq');
    expect(getExpression()).toMatch(/A \+ 5 =/);
  });

  test('decimal readout updates after calculation', () => {
    // A + 5 = F = 15 decimal
    'A'.split('').forEach(c => clickBtn(`btn-${c}`));
    clickBtn('btn-add');
    '5'.split('').forEach(c => clickBtn(`btn-${c}`));
    clickBtn('btn-eq');
    expect(getDecimal()).toBe('DEC: 15');
  });
});

// ─── 7. Error States ─────────────────────────────────────────────────────────
describe('Error handling in GUI', () => {
  test('dividing by 0 shows an error message on the display', () => {
    clickBtn('btn-A');
    clickBtn('btn-div');
    clickBtn('btn-0');
    clickBtn('btn-eq');
    // Error class should be applied or display text should indicate error
    const el = document.getElementById('display');
    const isError = el.classList.contains('error') || el.textContent.toLowerCase().includes('zero');
    expect(isError).toBe(true);
  });

  test('subtracting larger from smaller shows an error', () => {
    clickBtn('btn-5');
    clickBtn('btn-sub');
    clickBtn('btn-A');
    clickBtn('btn-eq');
    const el = document.getElementById('display');
    expect(el.classList.contains('error')).toBe(true);
  });
});

// ─── 8. Chained Operations ───────────────────────────────────────────────────
describe('Chained operations', () => {
  test('A + 5 then × 2 chains correctly (F × 2 = 1E)', () => {
    clickBtn('btn-A');
    clickBtn('btn-add');
    clickBtn('btn-5');
    clickBtn('btn-mul'); // triggers intermediate result: F
    clickBtn('btn-2');
    clickBtn('btn-eq');
    expect(getDisplay()).toBe('1E');
  });
});

// ─── 9. Post-calculation fresh input ─────────────────────────────────────────
describe('Post-calculation state', () => {
  test('typing a digit after = starts a fresh entry', () => {
    clickBtn('btn-A');
    clickBtn('btn-add');
    clickBtn('btn-5');
    clickBtn('btn-eq'); // result: F
    clickBtn('btn-1');  // should start fresh, not append to F
    expect(getDisplay()).toBe('1');
  });
});

// ─── 10. Keyboard input ──────────────────────────────────────────────────────
describe('Keyboard input', () => {
  function key(k, extra = {}) {
    document.dispatchEvent(new KeyboardEvent('keydown', { key: k, ...extra }));
  }

  test('keyboard digit "A" updates display', () => {
    key('a');
    expect(getDisplay()).toBe('A');
  });

  test('keyboard Enter triggers equals (A + 5 = F)', () => {
    key('a'); key('+'); key('5'); key('Enter');
    expect(getDisplay()).toBe('F');
  });

  test('keyboard Escape clears display', () => {
    key('a'); key('Escape');
    expect(getDisplay()).toBe('0');
  });

  test('keyboard Backspace removes last digit', () => {
    key('1'); key('f'); key('Backspace');
    expect(getDisplay()).toBe('1');
  });
});