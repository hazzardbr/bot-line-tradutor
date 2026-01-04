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

// ============== DETECTA Indonesian ==============
function isIndonesian(text) {
  return /\b(yang|dan|tidak|saya|kamu|apa|ini|itu|dari|ke|di|ada|bisa)\b/i.test(text);
}

// ================= WEBHOOK =====================
app.post('/webhook', line.middleware(config), async (req, res) => {
  try {
    for (const event of req.body.events) {
      if (event.type !== 'message' || event.message.type !== 'text') continue;

      const texto = event.message.text.trim();

      // Evita loop
      if (texto.startsWith('[')) continue;

      let origem, destino, textoParaTraduzir, prefixo;

      // ================= !HELP ==================
      if (texto.toLowerCase() === '!help') {
        await client.replyMessage(event.replyToken, {
          type: 'text',
          text:
`🤖 BOT TRADUTOR 🤖

🔁 AUTOMÁTICO:
Português → Inglês
Outros idiomas → Português

📌 COMANDOS:
!pt    Inglês → Português
!ptes  Espanhol → Português
!en    Português → Inglês
!es    Português → Espanhol
!ko    Português → Coreano

📍 EXEMPLOS:
Olá amigo
Hello friend
!en Olá amigo
!help`
        });
        continue;
      }

      // ============ COMANDOS MANUAIS ============
      if (texto.toLowerCase().startsWith('!ptes ')) {
        origem = 'es'; destino = 'pt';
        textoParaTraduzir = texto.slice(6);
        prefixo = 'TRADUÇÃO PT (ES)';
      }

      else if (texto.toLowerCase().startsWith('!pt ')) {
        origem = 'en'; destino = 'pt';
        textoParaTraduzir = texto.slice(4);
        prefixo = 'TRADUÇÃO PT';
      }

      else if (texto.toLowerCase().startsWith('!en ')) {
        origem = 'pt'; destino = 'en';
        textoParaTraduzir = texto.slice(4);
        prefixo = 'TRANSLATION EN';
      }

      else if (texto.toLowerCase().startsWith('!es ')) {
        origem = 'pt'; destino = 'es';
        textoParaTraduzir = texto.slice(4);
        prefixo = 'TRADUCCIÓN ES';
      }

      else if (texto.toLowerCase().startsWith('!ko ')) {
        origem = 'pt'; destino = 'ko';
        textoParaTraduzir = texto.slice(4);
        prefixo = '번역 (KO)';
      }

      // ============ AUTO TRADUÇÃO ============
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

// ============== DETECTA Indonesian ==============
function isIndonesian(text) {
  return /\b(yang|dan|tidak|saya|kamu|apa|ini|itu|dari|ke|di|ada|bisa)\b/i.test(text);
}

// ================= WEBHOOK =====================
app.post('/webhook', line.middleware(config), async (req, res) => {
  try {
    for (const event of req.body.events) {
      if (event.type !== 'message' || event.message.type !== 'text') continue;

      const texto = event.message.text.trim();

      // Evita loop
      if (texto.startsWith('[')) continue;

      let origem, destino, textoParaTraduzir, prefixo;

      // ================= !HELP ==================
      if (texto.toLowerCase() === '!help') {
        await client.replyMessage(event.replyToken, {
          type: 'text',
          text:
`🤖 BOT TRADUTOR 🤖

🔁 AUTOMÁTICO:
Português → Inglês
Outros idiomas → Português

📌 COMANDOS:
!pt    Inglês → Português
!ptes  Espanhol → Português
!en    Português → Inglês
!es    Português → Espanhol
!ko    Português → Coreano

📍 EXEMPLOS:
Olá amigo
Hello friend
!en Olá amigo
!help`
        });
        continue;
      }

      // ============ COMANDOS MANUAIS ============
      if (texto.toLowerCase().startsWith('!ptes ')) {
        origem = 'es'; destino = 'pt';
        textoParaTraduzir = texto.slice(6);
        prefixo = 'TRADUÇÃO PT (ES)';
      }

      else if (texto.toLowerCase().startsWith('!pt ')) {
        origem = 'en'; destino = 'pt';
        textoParaTraduzir = texto.slice(4);
        prefixo = 'TRADUÇÃO PT';
      }

      else if (texto.toLowerCase().startsWith('!en ')) {
        origem = 'pt'; destino = 'en';
        textoParaTraduzir = texto.slice(4);
        prefixo = 'TRANSLATION EN';
      }

      else if (texto.toLowerCase().startsWith('!es ')) {
        origem = 'pt'; destino = 'es';
        textoParaTraduzir = texto.slice(4);
        prefixo = 'TRADUCCIÓN ES';
      }

      else if (texto.toLowerCase().startsWith('!ko ')) {
        origem = 'pt'; destino = 'ko';
        textoParaTraduzir = texto.slice(4);
        prefixo = '번역 (KO)';
      }

      // ============ AUTO TRADUÇÃO ============
			  else {
		  textoParaTraduzir = texto;

		  if (isPortuguese(texto)) {
			// 🇧🇷 PT → EN
			origem = 'pt';
			destino = 'en';
			prefixo = 'AUTO EN';
		  }
		  else if (isIndonesian(texto)) {
			// 🇮🇩 ID → PT
			origem = 'id';
			destino = 'pt';
			prefixo = 'AUTO PT (ID)';
		  }
		  else {
			// 🌍 OUTROS → PT (assume EN)
			origem = 'en';
			destino = 'pt';
			prefixo = 'AUTO PT';
		  }
		}


      let traducaoTexto = '⚠️ Erro ao traduzir';

      try {
        const response = await axios.get(
          'https://api.mymemory.translated.net/get',
          {
            params: {
              q: textoParaTraduzir,
              langpair: `${origem}|${destino}`
            },
            timeout: 10000
          }
        );

        if (response.data?.responseData?.translatedText) {
          traducaoTexto = response.data.responseData.translatedText;
        }
      } catch (err) {
        console.error('Erro MyMemory:', err.message);
      }

      await client.replyMessage(event.replyToken, {
        type: 'text',
        text: `[${prefixo}]\n${traducaoTexto}`
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


      let traducaoTexto = '⚠️ Erro ao traduzir';

      try {
        const response = await axios.get(
          'https://api.mymemory.translated.net/get',
          {
            params: {
              q: textoParaTraduzir,
              langpair: `${origem}|${destino}`
            },
            timeout: 10000
          }
        );

        if (response.data?.responseData?.translatedText) {
          traducaoTexto = response.data.responseData.translatedText;
        }
      } catch (err) {
        console.error('Erro MyMemory:', err.message);
      }

      await client.replyMessage(event.replyToken, {
        type: 'text',
        text: `[${prefixo}]\n${traducaoTexto}`
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
