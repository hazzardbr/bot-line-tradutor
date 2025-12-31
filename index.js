require('dotenv').config();
const express = require('express');
const axios = require('axios');
const line = require('@line/bot-sdk');

const app = express();

// Configuração do LINE
const config = {
  channelSecret: process.env.LINE_CHANNEL_SECRET,
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN
};

const client = new line.Client(config);

// Webhook
app.post('/webhook', line.middleware(config), async (req, res) => {
  try {
    for (const event of req.body.events) {
      if (event.type !== 'message' || event.message.type !== 'text') continue;

      const texto = event.message.text.trim();

      let origem = null;
      let destino = null;
      let textoParaTraduzir = null;
      let prefixo = null;
	  
		  // Comando !help
		if (texto.toLowerCase() === '!help') {
	  await client.replyMessage(event.replyToken, {
		type: 'text',
		text:
	`🤖 Commands 🤖

	!pt   Inglês → Português
	!en   Português → Inglês
	!es   Português → Espanhol
	!ptes Espanhol → Português
	!ko   Português → Coreano

	Examples:
	!pt Hello my friend
	!en Olá meu amigo
	!ptes Hola amigo`
	  });
	  continue;
	}


      if (texto.toLowerCase().startsWith('!pt ')) {
        origem = 'en';
        destino = 'pt';
        textoParaTraduzir = texto.slice(4);
        prefixo = 'TRADUÇÃO PT';
      }
	  
	  if (texto.toLowerCase().startsWith('!ptes ')) {
		origem = 'es';
		destino = 'pt';
		textoParaTraduzir = texto.slice(6);
		prefixo = 'TRADUÇÃO PT (ES)';
      }


      if (texto.toLowerCase().startsWith('!en ')) {
        origem = 'pt';
        destino = 'en';
        textoParaTraduzir = texto.slice(4);
        prefixo = 'TRANSLATION EN';
      }

      if (texto.toLowerCase().startsWith('!es ')) {
        origem = 'pt';
        destino = 'es';
        textoParaTraduzir = texto.slice(4);
        prefixo = 'TRADUCCIÓN ES';
      }

      if (texto.toLowerCase().startsWith('!ko ')) {
        origem = 'pt';
        destino = 'ko';
        textoParaTraduzir = texto.slice(4);
        prefixo = '번역 (KO)';
      }

      // Se não for comando válido, ignora
      if (!origem || !destino || !textoParaTraduzir) continue;

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

// Rota teste
app.get('/', (req, res) => {
  res.send('🤖 Bot do LINE multilíngue está online');
});

app.listen(3000, () => {
  console.log('Servidor rodando na porta 3000');
});
