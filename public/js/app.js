// Установка сегодняшней даты по умолчанию
document.addEventListener('DOMContentLoaded', function() {
    const dateInput = document.getElementById('date');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.value = today;
    }
});

// Переключение отображения дат в истории
function toggleDates(button, name) {
    const datesDiv = button.nextElementSibling;
    const isVisible = datesDiv.style.display !== 'none';
    
    datesDiv.style.display = isVisible ? 'none' : 'block';
    button.setAttribute('aria-expanded', !isVisible);
}

// Переключение отображения дат в админ-панели
function toggleAdminDates(button, name) {
    const datesDiv = button.nextElementSibling;
    const isVisible = datesDiv.style.display !== 'none';
    
    datesDiv.style.display = isVisible ? 'none' : 'block';
    button.setAttribute('aria-expanded', !isVisible);
}

// Обработка формы добавления пропуска
const absenceForm = document.getElementById('absenceForm');
if (absenceForm) {
    absenceForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const name = document.getElementById('name').value;
        const date = document.getElementById('date').value;
        const messageElement = document.getElementById('formMessage');
        
        if (!name || !date) {
            showMessage('Пожалуйста, заполните все поля', 'error', messageElement);
            return;
        }
        
        try {
            const response = await fetch('/add-absence', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, date })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                showMessage(data.message, 'success', messageElement);
                document.getElementById('absenceForm').reset();
                
                // Установка сегодняшней даты
                const today = new Date().toISOString().split('T')[0];
                document.getElementById('date').value = today;
                
                // Перезагрузка страницы через 1.5 секунды
                setTimeout(() => {
                    location.reload();
                }, 1500);
            } else {
                showMessage(data.error || 'Ошибка при добавлении', 'error', messageElement);
            }
        } catch (error) {
            showMessage('Ошибка подключения: ' + error.message, 'error', messageElement);
            console.error('Error:', error);
        }
    });
}

// Обработка массового добавления пропусков
const bulkAbsenceForm = document.getElementById('bulkAbsenceForm');
if (bulkAbsenceForm) {
    bulkAbsenceForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const date = document.getElementById('bulkDate').value;
        const checkboxes = document.querySelectorAll('input[name="selectedFriends"]:checked');
        const names = Array.from(checkboxes).map(cb => cb.value);
        const messageElement = document.getElementById('bulkFormMessage');
        
        if (!date || names.length === 0) {
            showMessage('Пожалуйста, выберите дату и минимум одного человека', 'error', messageElement);
            return;
        }
        
        try {
            const response = await fetch('/add-bulk-absence', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ date, names })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                showMessage(data.message, 'success', messageElement);
                
                // Перезагрузка страницы через 1.5 секунды
                setTimeout(() => {
                    location.reload();
                }, 1500);
            } else {
                showMessage(data.error || 'Ошибка при добавлении', 'error', messageElement);
            }
        } catch (error) {
            showMessage('Ошибка подключения: ' + error.message, 'error', messageElement);
            console.error('Error:', error);
        }
    });
}

// Удаление пропуска
async function removeAbsence(name, date) {
    if (confirm(`Вы уверены, что хотите удалить пропуск для ${name} от ${date}?`)) {
        try {
            const response = await fetch('/remove-absence', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, date })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                // Перезагрузка страницы
                location.reload();
            } else {
                alert('Ошибка при удалении: ' + (data.error || 'Неизвестная ошибка'));
            }
        } catch (error) {
            alert('Ошибка подключения: ' + error.message);
            console.error('Error:', error);
        }
    }
}

// Обработка формы платежа
const paymentForm = document.getElementById('paymentForm');
if (paymentForm) {
    paymentForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const name = document.getElementById('paymentName').value;
        const amount = document.getElementById('paymentAmount').value;
        const messageElement = document.getElementById('paymentMessage');
        
        if (!name || !amount) {
            showMessage('Пожалуйста, заполните все поля', 'error', messageElement);
            return;
        }
        
        try {
            const response = await fetch('/add-payment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, amount: parseFloat(amount) })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                showMessage(data.message, 'success', messageElement);
                
                // Перезагрузка страницы через 1.5 секунды
                setTimeout(() => {
                    location.reload();
                }, 1500);
            } else {
                showMessage(data.error || 'Ошибка при добавлении платежа', 'error', messageElement);
            }
        } catch (error) {
            showMessage('Ошибка подключения: ' + error.message, 'error', messageElement);
            console.error('Error:', error);
        }
    });
}

// Удаление платежа
async function removePayment(paymentIndex) {
    if (confirm(`Вы уверены, что хотите удалить этот платеж?`)) {
        try {
            const response = await fetch('/remove-payment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ paymentIndex: parseInt(paymentIndex) })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                // Перезагрузка страницы
                location.reload();
            } else {
                alert('Ошибка при удалении: ' + (data.error || 'Неизвестная ошибка'));
            }
        } catch (error) {
            alert('Ошибка подключения: ' + error.message);
            console.error('Error:', error);
        }
    }
}

// Обработка формы расходов
const expenseForm = document.getElementById('expenseForm');
if (expenseForm) {
    expenseForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const amount = document.getElementById('expenseAmount').value;
        const comment = document.getElementById('expenseComment').value;
        const messageElement = document.getElementById('expenseMessage');
        
        if (!amount || !comment) {
            showMessage('Пожалуйста, заполните все поля', 'error', messageElement);
            return;
        }
        
        try {
            const response = await fetch('/add-expense', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ amount: parseFloat(amount), comment })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                showMessage(data.message, 'success', messageElement);
                document.getElementById('expenseForm').reset();
                
                // Перезагрузка страницы через 1.5 секунды
                setTimeout(() => {
                    location.reload();
                }, 1500);
            } else {
                showMessage(data.message || 'Ошибка при добавлении расхода', 'error', messageElement);
            }
        } catch (error) {
            showMessage('Ошибка подключения: ' + error.message, 'error', messageElement);
            console.error('Error:', error);
        }
    });
}

// Удаление расхода
async function removeExpense(index) {
    if (confirm(`Вы уверены, что хотите удалить этот расход?`)) {
        try {
            const response = await fetch('/remove-expense', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ index: parseInt(index) })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                // Перезагрузка страницы
                location.reload();
            } else {
                alert('Ошибка при удалении: ' + (data.message || 'Неизвестная ошибка'));
            }
        } catch (error) {
            alert('Ошибка подключения: ' + error.message);
            console.error('Error:', error);
        }
    }
}

// Показать сообщение
function showMessage(message, type, element) {
    element.textContent = message;
    element.className = 'message ' + type;
    
    // Автоматическое скрытие через 5 секунд
    if (type === 'success') {
        setTimeout(() => {
            element.className = 'message';
            element.textContent = '';
        }, 5000);
    }
}
