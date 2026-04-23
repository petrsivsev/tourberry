var TG_TOKEN = '8646252780:AAHaVj_6jwah54bbYVLLKk2jf5kCPCE31EQ';
var TG_CHAT = '5921278199';

function sendToTelegram(text) {
    fetch('https://api.telegram.org/bot' + TG_TOKEN + '/sendMessage', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({chat_id: TG_CHAT, text: text, parse_mode: 'HTML'})
    }).catch(function(){});
}
