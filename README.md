# bot-whatsapp

Bot para automatizar mensagens no WhatsApp usando JavaScript.

## Descrição

Este projeto é um chatbot que automatiza o envio de mensagens no WhatsApp, incluindo mensagens de boas-vindas, encerramento de sessão e aviso de inatividade. Feito em JavaScript utilizando a biblioteca [whatsapp-web.js](https://github.com/pedroslopez/whatsapp-web.js).

## Funcionalidades

- Envio automático de mensagem de boas-vindas
- Controle de sessões e encerramento automático após inatividade
- Mensagem de aviso antes do encerramento
- Lista de contatos ignorados
- Encerramento manual por palavras-chave

## Requisitos

- **Node.js** instalado na máquina ([Download Node.js](https://nodejs.org/))
- WhatsApp instalado e funcionando no celular
- npm (gerenciador de pacotes do Node.js)

## Instalação

```bash
git clone https://github.com/vitorcgarcia1/bot-whatsapp.git
cd bot-whatsapp
npm install
```

## Uso

1. Execute o bot:
    ```bash
    node chatbot.js
    ```
2. Escaneie o QR code com seu WhatsApp para iniciar a sessão.

## Dependências

- whatsapp-web.js
- qrcode-terminal
- moment-timezone
- openai (opcional, caso queira integrar com IA)

## Observações

- Certifique-se de ter o Node.js instalado antes de iniciar o projeto.
- Personalize mensagens e lista de contatos conforme sua necessidade no arquivo `chatbot.js`.

---

Desenvolvido por [vitorcgarcia1](https://github.com/vitorcgarcia1)
