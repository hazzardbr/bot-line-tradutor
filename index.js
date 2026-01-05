require('dotenv').config();
const express = require('express');
const axios = require('axios');
const line = require('@line/bot-sdk');

const app = express();

// ================= CONFIG LINE =================
const config = {
  channelSecret: process.env.LINE_CHANNEL_SECRET,
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN
};

const client = new line.Client(config);

// ============== DETECÇÕES =====================
function isPortuguese(text) {
  return /[ãõáéíóúâêôç]/i.test(text);
}

function isIndonesian(text) {
  return /\b(yang|dan|tidak|saya|kamu|apa|ini|itu|dari|ke|di|ada|bisa)\b/i.test(text);
}

function isKorean(text) {
  return /[\u3131-\uD79D]/.test(text);
}

// ============== FUNÇÃO DE TRADUÇÃO =============
async function traduzir(texto, origem, destino) {
  try {
    const res = await axios.get(
      'https://api.mymemory.translated.net/get',
      {
        params: {
          q: texto,
          langpair: `${origem}|${destino}`
        },
        timeout: 10000
      }
    );

    return res.data?.responseData?.translatedText || 'Erro na tradução';
  } catch (err) {
    console.error(`Erro ${origem}->${destino}:`, err.message);
    return 'Erro na tradução';
  }
}

// ================= WEBHOOK =====================
app.post('/webhook', line.middleware(config), async (req, res) => {
  try {
    for (const event of req.body.events) {
      if (event.type !== 'message' || event.message.type !== 'text') continue;

      const texto = event.message.text.trim();

      // Evita loop
      if (!texto || texto.startsWith('[')) continue;

      // ================= !HELP ==================
      if (texto.toLowerCase() === '!help') {
        await client.replyMessage(event.replyToken, {
          type: 'text',
          text:
`🤖 BOT TRADUTOR 🤖

🔁 AUTOMÁTICO:
🇮🇩 Indonésio → 🇧🇷 PT + 🇺🇸 EN
🇧🇷 Português → 🇺🇸 EN
🇰🇷 Coreano → 🇧🇷 PT
🌍 Outros → 🇧🇷 PT

📌 COMANDOS:
!ptes Espanhol → Português
!en   Português → Inglês
!es   Português → Espanhol
!ko   Português → Coreano`
        });
        continue;
      }

      // ============ COMANDOS MANUAIS ============
      if (texto.toLowerCase().startsWith('!ptes ')) {
        const t = texto.slice(6).trim();
        if (!t) continue;
        const r = await traduzir(t, 'es', 'pt');
        await client.replyMessage(event.replyToken, { type: 'text', text: `[PT 🇧🇷]\n${r}` });
        continue;
      }

      if (texto.toLowerCase().startsWith('!en ')) {
        const t = texto.slice(4).trim();
        if (!t) continue;
        const r = await traduzir(t, 'pt', 'en');
        await client.replyMessage(event.replyToken, { type: 'text', text: `[EN 🇺🇸]\n${r}` });
        continue;
      }

      if (texto.toLowerCase().startsWith('!es ')) {
        const t = texto.slice(4).trim();
        if (!t) continue;
        const r = await traduzir(t, 'pt', 'es');
        await client.replyMessage(event.replyToken, { type: 'text', text: `[ES 🇪🇸]\n${r}` });
        continue;
      }

      if (texto.toLowerCase().startsWith('!ko ')) {
        const t = texto.slice(4).trim();
        if (!t) continue;
        const r = await traduzir(t, 'pt', 'ko');
        await client.replyMessage(event.replyToken, { type: 'text', text: `[KO 🇰🇷]\n${r}` });
        continue;
      }

      // 🚫 BLOQUEIA AUTO PARA COMANDO INVÁLIDO
      if (texto.startsWith('!')) {
        await client.replyMessage(event.replyToken, {
          type: 'text',
          text: '❗ Comando não reconhecido.\nUse !help para ver os comandos disponíveis.'
        });
        continue;
      }

      // ============ AUTO: INDONÉSIO ============
      if (isIndonesian(texto)) {
        const pt = await traduzir(texto, 'id', 'pt');
        const en = await traduzir(texto, 'id', 'en');

        await client.replyMessage(event.replyToken, {
          type: 'text',
          text:
`[AUTO PT 🇧🇷]
${pt}

[AUTO EN 🇺🇸]
${en}`
        });
        continue;
      }

      // ============ AUTO: COREANO ============
      if (isKorean(texto)) {
        const pt = await traduzir(texto, 'ko', 'pt');
        await client.replyMessage(event.replyToken, {
          type: 'text',
          text: `[AUTO PT 🇧🇷]\n${pt}`
        });
        continue;
      }

      // ============ AUTO: PORTUGUÊS ============
      if (isPortuguese(texto)) {
        const en = await traduzir(texto, 'pt', 'en');
        await client.replyMessage(event.replyToken, {
          type: 'text',
          text: `[AUTO EN 🇺🇸]\n${en}`
        });
        continue;
      }

      // ============ AUTO: OUTROS ============
      const pt = await traduzir(texto, 'en', 'pt');
      await client.replyMessage(event.replyToken, {
        type: 'text',
        text: `[AUTO PT 🇧🇷]\n${pt}`
      });
    }

    res.sendStatus(200);
  } catch (err) {
    console.error('Erro geral:', err.message);
    res.sendStatus(500);
  }
});

// ================= TESTE ======================
app.get('/', (req, res) => {
  res.send('🤖 Bot do LINE está online');
});

// ================= SERVER =====================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Servidor rodando na porta', PORT);
});
