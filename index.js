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

// ============== DETECTA PORTUGUÊS ==============
function isPortuguese(text) {
  return /[ãõáéíóúâêôç]/i.test(text);
}

// ============== DETECTA INDONÉSIO ==============
function isIndonesian(text) {
  return /\b(yang|dan|tidak|saya|kamu|apa|ini|itu|dari|ke|di|ada|bisa)\b/i.test(text);
}

// ============== FUNÇÃO DE TRADUÇÃO ==============
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

📌 COMANDOS: !pt Inglês → Português 
!ptes Espanhol → Português 
!en Português → Inglês 
!es Português → Espanhol 
!ko Português → Coreano

        });
        continue;
      }

      // ================= COMANDOS =================
      if (texto.toLowerCase().startsWith('!en ')) {
        const conteudo = texto.slice(4);
        const traducao = await traduzir(conteudo, 'pt', 'en');

        await client.replyMessage(event.replyToken, {
          type: 'text',
          text: `[EN]\n${traducao}`
        });
        continue;
      }

      if (texto.toLowerCase().startsWith('!pt ')) {
        const conteudo = texto.slice(4);
        const traducao = await traduzir(conteudo, 'en', 'pt');

        await client.replyMessage(event.replyToken, {
          type: 'text',
          text: `[PT]\n${traducao}`
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
