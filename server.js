const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const session = require('express-session');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = '8888';

// JSONBin конфигурация
const JSONBIN_BIN_ID = '697da8ecd0ea881f4095597a';
const JSONBIN_API_KEY = '$2a$10$J24VfFSehaO.P78eeSB/feH0/x9TKke3QBNn5eaCyqzwEnwv/w4sC';
const JSONBIN_URL = `https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`;

// Настройка middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public'));
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 3600000 }
}));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Пути к файлам данных (локальный backup)
const dataPath = path.join(__dirname, 'data', 'data.json');

// Функции для работы с данными
async function readData() {
  try {
    const response = await axios.get(JSONBIN_URL, {
      headers: {
        'X-Master-Key': JSONBIN_API_KEY
      }
    });
    return response.data.record;
  } catch (err) {
    console.log('JSONBin error, reading from local file:', err.message);
    try {
      const data = fs.readFileSync(dataPath, 'utf8');
      return JSON.parse(data);
    } catch (localErr) {
      return { friends: [], absences: [], payments: [] };
    }
  }
}

async function writeData(data) {
  try {
    await axios.put(JSONBIN_URL, data, {
      headers: {
        'X-Master-Key': JSONBIN_API_KEY,
        'Content-Type': 'application/json'
      }
    });
    console.log('Data saved to JSONBin');
  } catch (err) {
    console.log('JSONBin save error:', err.message);
  }
  
  try {
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
  } catch (localErr) {
    console.log('Local save error:', localErr.message);
  }
}

// Главная страница
app.get('/', async (req, res) => {
  const data = await readData();
  
  if (!data.payments) {
    data.payments = [];
  }
  if (!data.expenses) {
    data.expenses = [];
  }
  if (!data.debts) {
    data.debts = [];
  }
  
  const stats = data.friends.map(friend => {
    const totalAbsences = data.absences.filter(absence => absence.name === friend).length;
    const absenceDebt = totalAbsences * 2000;
    const directDebts = data.debts.filter(d => d.name === friend).reduce((sum, d) => sum + (d.amount || 0), 0);
    const totalDebtAmount = absenceDebt + directDebts;
    const paidAmount = data.payments.filter(p => p.name === friend).reduce((sum, p) => sum + (p.amount || 0), 0);
    const remainingDebt = Math.max(0, totalDebtAmount - paidAmount);
    const overpayment = Math.max(0, paidAmount - totalDebtAmount);
    return { name: friend, totalAbsences, absenceDebt, directDebts, totalDebtAmount, paidAmount, remainingDebt, overpayment };
  });
  
  stats.sort((a, b) => b.remainingDebt - a.remainingDebt);
  
  const uniqueDates = [...new Set(data.absences.map(absence => absence.date))].sort().reverse();
  const totalDebt = stats.reduce((sum, stat) => sum + stat.remainingDebt, 0);
  const totalPaid = data.payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const totalExpenses = data.expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const cashBalance = totalPaid - totalExpenses;
  
  res.render('index', { 
    friends: data.friends, 
    stats, 
    absences: data.absences,
    dates: uniqueDates,
    payments: data.payments,
    expenses: data.expenses,
    totalDebt,
    totalPaid,
    totalExpenses,
    cashBalance,
    isAdmin: req.session.isAdmin || false
  });
});

// Страница входа в админ
app.get('/admin-login', (req, res) => {
  res.render('admin-login', { error: '' });
});

// Проверка пароля
app.post('/admin-login', (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    req.session.isAdmin = true;
    res.redirect('/admin');
  } else {
    res.render('admin-login', { error: 'Неверный пароль' });
  }
});

// Админ панель
app.get('/admin', async (req, res) => {
  if (!req.session.isAdmin) {
    return res.redirect('/admin-login');
  }
  
  const data = await readData();
  
  if (!data.payments) {
    data.payments = [];
  }
  if (!data.expenses) {
    data.expenses = [];
  }
  if (!data.debts) {
    data.debts = [];
  }
  
  const stats = data.friends.map(friend => {
    const totalAbsences = data.absences.filter(absence => absence.name === friend).length;
    const absenceDebt = totalAbsences * 2000;
    const directDebts = data.debts.filter(d => d.name === friend).reduce((sum, d) => sum + (d.amount || 0), 0);
    const totalDebtAmount = absenceDebt + directDebts;
    const paidAmount = data.payments.filter(p => p.name === friend).reduce((sum, p) => sum + (p.amount || 0), 0);
    const remainingDebt = Math.max(0, totalDebtAmount - paidAmount);
    const overpayment = Math.max(0, paidAmount - totalDebtAmount);
    return { name: friend, totalAbsences, absenceDebt, directDebts, totalDebtAmount, paidAmount, remainingDebt, overpayment };
  });
  
  stats.sort((a, b) => b.remainingDebt - a.remainingDebt);
  
  const totalDebt = stats.reduce((sum, stat) => sum + stat.remainingDebt, 0);
  const totalPaid = data.payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const totalExpenses = data.expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const cashBalance = totalPaid - totalExpenses;
  
  res.render('admin', { 
    friends: data.friends, 
    stats, 
    absences: data.absences,
    payments: data.payments,
    debts: data.debts,
    expenses: data.expenses,
    totalDebt,
    totalPaid,
    totalExpenses,
    cashBalance
  });
});

// Выход из админ
app.get('/admin-logout', (req, res) => {
  req.session.isAdmin = false;
  res.redirect('/');
});

// Добавление пропуска
app.post('/add-absence', async (req, res) => {
  const { name, date } = req.body;
  
  if (!name || !date) {
    return res.status(400).json({ error: 'Необходимы имя и дата' });
  }
  
  const data = await readData();
  
  const exists = data.absences.some(absence => 
    absence.name === name && absence.date === date
  );
  
  if (!exists) {
    data.absences.push({ name, date });
    await writeData(data);
    return res.json({ success: true, message: 'Пропуск добавлен' });
  } else {
    return res.status(400).json({ error: 'Этот пропуск уже добавлен' });
  }
});

// Массовое добавление пропусков на определенную дату
app.post('/add-bulk-absence', async (req, res) => {
  if (!req.session.isAdmin) {
    return res.status(403).json({ error: 'Доступ запрещен' });
  }
  
  const { date, names } = req.body;
  
  if (!date || !names || !Array.isArray(names) || names.length === 0) {
    return res.status(400).json({ error: 'Необходимы дата и минимум одно имя' });
  }
  
  const data = await readData();
  let addedCount = 0;
  let skippedCount = 0;
  
  names.forEach(name => {
    const exists = data.absences.some(absence => 
      absence.name === name && absence.date === date
    );
    
    if (!exists) {
      data.absences.push({ name, date });
      addedCount++;
    } else {
      skippedCount++;
    }
  });
  
  if (addedCount > 0) {
    await writeData(data);
  }
  
  const message = `Добавлено ${addedCount} пропусков${skippedCount > 0 ? `, пропущено ${skippedCount}` : ''}`;
  res.json({ success: true, message });
});

// Удаление пропуска
app.post('/remove-absence', async (req, res) => {
  const { name, date } = req.body;
  
  if (!name || !date) {
    return res.status(400).json({ error: 'Необходимы имя и дата' });
  }
  
  const data = await readData();
  data.absences = data.absences.filter(absence => 
    !(absence.name === name && absence.date === date)
  );
  await writeData(data);
  
  res.json({ success: true, message: 'Пропуск удален' });
});

// Добавление платежа
app.post('/add-payment', async (req, res) => {
  if (!req.session.isAdmin) {
    return res.status(403).json({ error: 'Доступ запрещен' });
  }
  
  const { name, amount } = req.body;
  
  if (!name || !amount) {
    return res.status(400).json({ error: 'Необходимо имя и сумма' });
  }
  
  const data = await readData();
  
  data.payments.push({ name, amount: parseFloat(amount), date: new Date().toISOString().split('T')[0] });
  await writeData(data);
  
  return res.json({ success: true, message: `Платеж ${amount} тг добавлен` });
});

// Удаление платежа
app.post('/remove-payment', async (req, res) => {
  if (!req.session.isAdmin) {
    return res.status(403).json({ error: 'Доступ запрещен' });
  }
  
  const { paymentIndex } = req.body;
  
  if (paymentIndex === undefined) {
    return res.status(400).json({ error: 'Необходимо указать платеж' });
  }
  
  const data = await readData();
  data.payments.splice(parseInt(paymentIndex), 1);
  await writeData(data);
  
  res.json({ success: true, message: 'Платеж удален' });
});

// Получение пропусков в JSON формате
app.get('/api/absences', async (req, res) => {
  const data = await readData();
  res.json({ absences: data.absences });
});

// Добавить долг напрямую
app.post('/add-debt', async (req, res) => {
  if (!req.session.isAdmin) {
    return res.status(403).json({ success: false, message: 'Доступ запрещен' });
  }
  
  const { name, amount, comment } = req.body;
  
  if (!name || !amount || isNaN(amount)) {
    return res.status(400).json({ success: false, message: 'Укажите имя и сумму' });
  }
  
  const data = await readData();
  
  if (!data.debts) {
    data.debts = [];
  }
  
  data.debts.push({
    name,
    amount: parseFloat(amount),
    comment: comment || '',
    date: new Date().toLocaleDateString('ru-RU'),
    timestamp: new Date().toISOString()
  });
  
  await writeData(data);
  
  res.json({ success: true, message: `Долг ${amount} тг добавлен для ${name}` });
});

// Удалить долг
app.post('/remove-debt', async (req, res) => {
  if (!req.session.isAdmin) {
    return res.status(403).json({ success: false, message: 'Доступ запрещен' });
  }
  
  const { index } = req.body;
  const data = await readData();
  
  if (!data.debts || !data.debts[index]) {
    return res.status(400).json({ success: false, message: 'Долг не найден' });
  }
  
  data.debts.splice(index, 1);
  await writeData(data);
  
  res.json({ success: true, message: 'Долг удален' });
});

// Добавить расход
app.post('/add-expense', async (req, res) => {
  if (!req.session.isAdmin) {
    return res.status(403).json({ success: false, message: 'Доступ запрещен' });
  }
  
  const { amount, comment } = req.body;
  
  if (!amount || isNaN(amount)) {
    return res.status(400).json({ success: false, message: 'Укажите сумму' });
  }
  
  const data = await readData();
  
  if (!data.expenses) {
    data.expenses = [];
  }
  
  data.expenses.push({
    amount: parseFloat(amount),
    comment: comment || '',
    date: new Date().toLocaleDateString('ru-RU'),
    timestamp: new Date().toISOString()
  });
  
  await writeData(data);
  
  res.json({ success: true, message: 'Расход добавлен' });
});

// Удалить расход
app.post('/remove-expense', async (req, res) => {
  if (!req.session.isAdmin) {
    return res.status(403).json({ success: false, message: 'Доступ запрещен' });
  }
  
  const { index } = req.body;
  const data = await readData();
  
  if (!data.expenses || !data.expenses[index]) {
    return res.status(400).json({ success: false, message: 'Расход не найден' });
  }
  
  data.expenses.splice(index, 1);
  await writeData(data);
  
  res.json({ success: true, message: 'Расход удален' });
});

// Экспорт данных в CSV
app.get('/export-csv', async (req, res) => {
  const data = await readData();
  
  let csv = 'Имя,Дата\n';
  
  data.absences.forEach(absence => {
    const date = absence.date || 'Не указана';
    csv += `${absence.name},"${date}"\n`;
  });
  
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="absences.csv"');
  res.send('\uFEFF' + csv);
});

// Слушание портa
app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});
