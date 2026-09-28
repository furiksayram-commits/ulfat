function getDebtStatus(remainingDebt, overpayment, totalDebtAmount) {
  if (remainingDebt > 0) {
    return `${remainingDebt} тг`;
  }

  return '✅ Оплачено';
}

function getCleanState(data) {
  return {
    friends: data.friends || [],
    absences: [],
    payments: [],
    debts: [],
    expenses: []
  };
}

module.exports = {
  getDebtStatus,
  getCleanState
};
