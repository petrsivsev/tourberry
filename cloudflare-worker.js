/**
 * Tourberry AI Chat — Cloudflare Worker
 *
 * Деплой:
 * 1. Зайди на https://workers.cloudflare.com → создай новый Worker
 * 2. Вставь этот код
 * 3. В Settings → Variables → добавь переменную среды: ANTHROPIC_API_KEY = sk-ant-...
 * 4. Скопируй URL воркера (вида https://tourberry-chat.xxx.workers.dev)
 * 5. Вставь этот URL в chat-widget.js в переменную CHAT_WORKER_URL
 */

const SYSTEM_PROMPT = `Ты — дружелюбный ассистент турагентства Tourberry из Якутска.

О нас:
- Специализируемся на турах в Китай, Корею, Японию, Таиланд, ОАЭ, Турцию, Грузию
- Директор: Юлия Дорофеева
- Адрес: г. Якутск, БЦ «Японский дом», ул. Дзержинского, 26/4
- Телефон: +7 (967) 925-14-31
- Режим работы: Пн–Пт 10:00–19:00, Сб 11:00–17:00
- Сайт: tourberry.agency

Как отвечать:
- Кратко и по делу, на русском языке
- При вопросах о конкретных ценах — объясни, что точную стоимость назовёт менеджер, и предложи оставить контакт
- При вопросах о визах — расскажи общие условия, конкретику уточнит менеджер
- Не придумывай конкретные цены, даты и наличие мест — этого ты не знаешь
- В конце ответа, если уместно, предлагай позвонить или оставить заявку на сайте
- Максимальная длина ответа: 3–4 предложения`;

export default {
    async fetch(request, env) {
        // CORS preflight
        if (request.method === 'OPTIONS') {
            return new Response(null, {
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type',
                },
            });
        }

        if (request.method !== 'POST') {
            return new Response('Method not allowed', { status: 405 });
        }

        let body;
        try {
            body = await request.json();
        } catch {
            return jsonResponse({ error: 'Неверный формат запроса' }, 400);
        }

        const messages = body.messages;
        if (!Array.isArray(messages) || messages.length === 0) {
            return jsonResponse({ error: 'Нет сообщений' }, 400);
        }

        // Limit history to last 20 messages to control token usage
        const trimmed = messages.slice(-20);

        const apiResponse = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'x-api-key': env.ANTHROPIC_API_KEY,
                'anthropic-version': '2023-06-01',
                'content-type': 'application/json',
            },
            body: JSON.stringify({
                model: 'claude-haiku-4-5-20251001',
                max_tokens: 300,
                system: SYSTEM_PROMPT,
                messages: trimmed,
            }),
        });

        if (!apiResponse.ok) {
            const err = await apiResponse.text();
            console.error('Anthropic API error:', err);
            return jsonResponse({ error: 'Ошибка сервера. Позвоните нам: +7 (967) 925-14-31' }, 502);
        }

        const data = await apiResponse.json();
        return jsonResponse(data);
    },
};

function jsonResponse(body, status = 200) {
    return new Response(JSON.stringify(body), {
        status,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
        },
    });
}
