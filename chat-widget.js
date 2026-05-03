/**
 * Tourberry AI Chat Widget
 * Sends messages to a Cloudflare Worker proxy that calls Claude API.
 * Set CHAT_WORKER_URL to your deployed Worker URL before using.
 */

var CHAT_WORKER_URL = 'https://tourberry-worker.petr-sivsev.workers.dev';

(function () {
    /* ---- Inject styles ---- */
    var style = document.createElement('style');
    style.textContent = [
        '.tb-chat-btn{position:fixed;bottom:1.75rem;right:1.75rem;width:56px;height:56px;border-radius:50%;background:#FF5500;color:#fff;border:none;cursor:pointer;box-shadow:0 4px 20px rgba(255,85,0,.45);display:flex;align-items:center;justify-content:center;z-index:9000;transition:transform .2s,box-shadow .2s}',
        '.tb-chat-btn:hover{transform:scale(1.08);box-shadow:0 6px 28px rgba(255,85,0,.55)}',
        '.tb-chat-btn svg{width:26px;height:26px;fill:currentColor}',
        '.tb-chat-win{position:fixed;bottom:5.5rem;right:1.75rem;width:360px;max-width:calc(100vw - 2rem);background:#fff;border-radius:16px;box-shadow:0 8px 40px rgba(0,0,0,.18);z-index:9000;display:none;flex-direction:column;overflow:hidden;font-family:Montserrat,sans-serif}',
        '.tb-chat-win.open{display:flex}',
        '.tb-chat-head{background:#1A1A1A;color:#fff;padding:.9rem 1.1rem;display:flex;align-items:center;gap:.75rem}',
        '.tb-chat-head img{width:36px;height:36px;border-radius:50%;object-fit:cover;object-position:top}',
        '.tb-chat-head-info strong{display:block;font-size:.88rem;font-weight:700}',
        '.tb-chat-head-info span{font-size:.72rem;color:rgba(255,255,255,.6)}',
        '.tb-chat-close{margin-left:auto;background:none;border:none;color:rgba(255,255,255,.7);cursor:pointer;font-size:1.2rem;line-height:1;padding:.2rem}',
        '.tb-chat-close:hover{color:#fff}',
        '.tb-chat-msgs{flex:1;overflow-y:auto;padding:1rem;display:flex;flex-direction:column;gap:.65rem;max-height:340px;min-height:200px}',
        '.tb-msg{max-width:82%;padding:.6rem .85rem;border-radius:12px;font-size:.87rem;line-height:1.55;word-break:break-word}',
        '.tb-msg.bot{background:#F5F5F5;color:#2B2B2B;align-self:flex-start;border-bottom-left-radius:4px}',
        '.tb-msg.user{background:#FF5500;color:#fff;align-self:flex-end;border-bottom-right-radius:4px}',
        '.tb-msg.typing{color:#6B6B6B;font-style:italic}',
        '.tb-chat-form{display:flex;gap:.5rem;padding:.75rem 1rem;border-top:1px solid #E0E0E0}',
        '.tb-chat-form input{flex:1;border:1.5px solid #E0E0E0;border-radius:8px;padding:.55rem .8rem;font-family:inherit;font-size:.88rem;outline:none;transition:border-color .2s}',
        '.tb-chat-form input:focus{border-color:#FF5500}',
        '.tb-chat-form button{background:#FF5500;color:#fff;border:none;border-radius:8px;padding:.55rem .85rem;cursor:pointer;font-size:.88rem;font-weight:600;transition:background .2s;flex-shrink:0}',
        '.tb-chat-form button:hover{background:#CC4400}',
        '.tb-chat-form button:disabled{opacity:.5;cursor:default}',
        '@media(max-width:480px){.tb-chat-win{right:.75rem;bottom:5rem;width:calc(100vw - 1.5rem)}.tb-chat-btn{right:.75rem;bottom:1rem}}'
    ].join('');
    document.head.appendChild(style);

    /* ---- Build HTML ---- */
    var html = '<button class="tb-chat-btn" id="tb-toggle" aria-label="Чат с помощником">'
        + '<svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>'
        + '</button>'
        + '<div class="tb-chat-win" id="tb-win">'
        +   '<div class="tb-chat-head">'
        +     '<img src="julia-dorofeeva.png" alt="Юлия">'
        +     '<div class="tb-chat-head-info"><strong>Tourberry Ассистент</strong><span>Отвечает мгновенно</span></div>'
        +     '<button class="tb-chat-close" id="tb-close" aria-label="Закрыть">✕</button>'
        +   '</div>'
        +   '<div class="tb-chat-msgs" id="tb-msgs"></div>'
        +   '<form class="tb-chat-form" id="tb-form">'
        +     '<input type="text" id="tb-input" placeholder="Напишите вопрос..." autocomplete="off" required>'
        +     '<button type="submit" id="tb-send">→</button>'
        +   '</form>'
        + '</div>';

    var wrap = document.createElement('div');
    wrap.innerHTML = html;
    document.body.appendChild(wrap);

    /* ---- State ---- */
    var messages = []; // {role, content}
    var isOpen = false;
    var isTyping = false;
    var greeted = false;

    /* ---- Elements ---- */
    var toggleBtn = document.getElementById('tb-toggle');
    var win = document.getElementById('tb-win');
    var closeBtn = document.getElementById('tb-close');
    var form = document.getElementById('tb-form');
    var input = document.getElementById('tb-input');
    var sendBtn = document.getElementById('tb-send');
    var msgsEl = document.getElementById('tb-msgs');

    /* ---- Toggle ---- */
    toggleBtn.addEventListener('click', function () {
        isOpen = !isOpen;
        win.classList.toggle('open', isOpen);
        if (isOpen) {
            input.focus();
            if (!greeted) { showGreeting(); greeted = true; }
        }
    });
    closeBtn.addEventListener('click', function () {
        isOpen = false;
        win.classList.remove('open');
    });

    /* ---- Greeting ---- */
    function showGreeting() {
        addMessage('bot', 'Привет! Я помощник турагентства Tourberry. Расскажу о турах, визах, ценах и условиях. Чем могу помочь?');
    }

    /* ---- Add message to UI ---- */
    function addMessage(role, text) {
        var div = document.createElement('div');
        div.className = 'tb-msg ' + role;
        div.textContent = text;
        msgsEl.appendChild(div);
        msgsEl.scrollTop = msgsEl.scrollHeight;
        return div;
    }

    /* ---- Typing indicator ---- */
    function showTyping() {
        var div = addMessage('bot typing', '...');
        return div;
    }

    /* ---- Send message ---- */
    form.addEventListener('submit', function (e) {
        e.preventDefault();
        var text = input.value.trim();
        if (!text || isTyping) return;
        input.value = '';
        addMessage('user', text);
        messages.push({ role: 'user', content: text });
        sendToAI();
    });

    function sendToAI() {
        isTyping = true;
        sendBtn.disabled = true;
        var typingEl = showTyping();

        fetch(CHAT_WORKER_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages: messages })
        })
        .then(function (r) { return r.json(); })
        .then(function (data) {
            typingEl.remove();
            var reply = (data.content && data.content[0] && data.content[0].text)
                ? data.content[0].text
                : (data.error || 'Извините, не удалось получить ответ. Позвоните нам: +7 (967) 925-14-31');
            addMessage('bot', reply);
            messages.push({ role: 'assistant', content: reply });
        })
        .catch(function () {
            typingEl.remove();
            addMessage('bot', 'Соединение прервалось. Позвоните нам: +7 (967) 925-14-31');
        })
        .finally(function () {
            isTyping = false;
            sendBtn.disabled = false;
            input.focus();
        });
    }
})();
