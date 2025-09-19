//=============================== CHAT BOT PARA WHATSAPP ===============================\\

// leitor de qr code
const qrcode = require('qrcode-terminal');
const { Client } = require('whatsapp-web.js');
const client = new Client();

client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('Tudo certo! WhatsApp conectado.');
});

client.initialize();

// Contatos ignorados (não recebem mensagens automáticas)
const contatosIgnorados = [
    '5500000000000@c.us', // coloque o ddd e o número de telefone 

];

// Controle de sessões
let waitingReply = {};
let warningsSent = {};
let clientesBoasVindas = {};

// mensagens do cliente
client.on('message', async msg => {
    if (msg.fromMe) return;

    const chatID = msg.from;

    // Ignora contatos da lista
    if (contatosIgnorados.includes(chatID)) return; //váriavel do ignora contatos

    // mensagem de boas vindas é enviado apenas 1 vez
    if (!clientesBoasVindas[chatID]) {
        const contact = await msg.getContact();
        const nome = contact.pushname || "Cliente";

        await client.sendMessage(
            chatID,
            `👋 Olá, *${nome}*.\n\nSeja bem-vindo(a) à *Sua empresa*.\nPor favor, aguarde um momento que em breve iniciaremos o seu atendimento.` //// personalize a mensagem de boas vindas da forma que quiser
        );

        clientesBoasVindas[chatID] = true;
        console.log(`Mensagem de boas-vindas enviada para ${chatID} (${nome})`);
        return;
    }

    // Cliente respondeu reseta o time para enviar a mensagem de aviso 
    if (waitingReply[chatID]) {
        console.log(`Cliente ${chatID} respondeu. Resetando timers.`);
        delete waitingReply[chatID];
        delete warningsSent[chatID];
    }
});

// MENSAGENS ENVIADAS PELO OPERADOR
client.on('message_create', async (msg) => {
    if (!msg.fromMe) return;

    const chatID = msg.to;
    const textoOriginal = msg.body.trim();

    // Ignora comandos (ex: "#comando")
    if (textoOriginal.startsWith('#')) return;

    // Normaliza texto (remove acentos, caixa baixa)
    const texto = textoOriginal.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

    // Palavras-chave de encerramento manual
    const palavrasEncerramento = ['ok', 'de nada', 'tabom', 'ta bom', 'tá bom', 'tá', 'que bom', 'tá certo'];

    const deveEncerrar = palavrasEncerramento.some(p => {
        const regex = new RegExp(`\\b${p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
        return regex.test(texto);
    });

    if (deveEncerrar) {
        await client.sendMessage(
            chatID,
            `⏹️ Sua sessão foi encerrada. Agradecemos o contato. Caso precise, estamos à disposição.` // personalize a mensagem de encerramento da forma que quiser 
        );

        delete waitingReply[chatID];
        delete warningsSent[chatID];
        delete clientesBoasVindas[chatID];

        console.log(`✅ Sessão encerrada manualmente por palavra-chave em ${chatID}`);
        return;
    }

    // Inicia o timer se ainda não estiver ativo
    if (!waitingReply[chatID] && !contatosIgnorados.includes(chatID)) {
        waitingReply[chatID] = Date.now();
        warningsSent[chatID] = false;
        console.log(`⏱️ Timer de inatividade iniciado para ${chatID}`);
    }

    console.log(`Mensagem enviada para ${chatID}: ${textoOriginal}`);
});

// tempo que se passa para cada aviso
const END_SESSION_MS = 30 * 60 * 1000; // se passar 30 minutos e ningém respoder a sessão se encerra com a mensagem automática
const WARNING_MS = 15 * 60 * 1000;     // se passar 15 minutos a mensagem de alerta que vai encerrar a sessão se não falar nada em 15 minutos vai aparecer
// ESCOLHA O TEMPO DA FORMA QUE PREFERIR




setInterval(async () => {
    const now = Date.now();

    for (const chatID in waitingReply) {
        if (contatosIgnorados.includes(chatID)) continue;

        const lastTime = waitingReply[chatID];
        if (typeof lastTime !== 'number') continue;

        const timeSinceLast = now - lastTime;

        if (timeSinceLast >= END_SESSION_MS) {
            await client.sendMessage(
                chatID,
                `⏹️ Sua sessão foi *encerrada* por falta de interação.\nCaso precise, inicie uma nova conversa.` //mensagem de encerramento por falta de interação
            );

            delete waitingReply[chatID];
            delete warningsSent[chatID];
            delete clientesBoasVindas[chatID];

            console.log(`✅ Sessão encerrada no chat ${chatID}.`);
        } else if (timeSinceLast >= WARNING_MS && !warningsSent[chatID]) {
            warningsSent[chatID] = true;

            await client.sendMessage(
                chatID,
                `⚠️ Atenção: ainda não recebemos sua resposta.\nCaso não haja interação em *15 minutos*, sua sessão será encerrada.` //mensagem de aviso que vai encerrar daqui x minutos 
            );

            console.log(`⚠️ Aviso de inatividade enviado para o chat ${chatID}`);
        }
    }
}, 30 * 1000); // Executa a cada 30 segundos
