const test = require('node:test');
const assert = require('node:assert/strict');

const { getDebtStatus, getCleanState } = require('../logic');

test('status is paid when no debt is left', () => {
  assert.equal(getDebtStatus(0, 0, 0), '✅ Оплачено');
  assert.equal(getDebtStatus(0, 500, 0), '✅ Оплачено');
});

test('status shows remaining debt when debt still exists', () => {
  assert.equal(getDebtStatus(5000, 2000, 5000), '5000 тг');
  assert.equal(getDebtStatus(1200, 0, 1200), '1200 тг');
});

test('cleanState clears all movement data but keeps friends', () => {
  const data = {
    friends: ['Иван', 'Петр'],
    absences: [{ name: 'Иван', date: '2024-01-10' }],
    payments: [{ name: 'Иван', amount: 1000 }],
    debts: [{ name: 'Петр', amount: 500 }],
    expenses: [{ amount: 200 }]
  };

  assert.deepEqual(getCleanState(data), {
    friends: ['Иван', 'Петр'],
    absences: [],
    payments: [],
    debts: [],
    expenses: []
  });
});
