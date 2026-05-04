var TELEGRAM_WORKER_URL = 'https://tourberry-forms.petr-sivsev.workers.dev';

function tgEscape(value) {
    return String(value || '').replace(/[&<>]/g, function(char) {
        return {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;'
        }[char];
    });
}

async function sendToTelegram(text) {
    var response = await fetch(TELEGRAM_WORKER_URL, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({text: text})
    });

    var data = {};
    try {
        data = await response.json();
    } catch (error) {
        data = {};
    }

    if (!response.ok || data.ok !== true) {
        throw new Error(data.error || 'Telegram request failed');
    }

    return data;
}

function showTelegramError(error) {
    console.error('Telegram submit error:', error);
    alert('Не получилось отправить заявку. Пожалуйста, напишите нам в Telegram или позвоните: +7 (967) 925-14-31');
}
