/* jshint esversion:6 */

require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const debug = require('./helpers');

const TOKEN = process.env.TOKEN;

console.log("Бот успешно запущен!");

const bot = new TelegramBot(TOKEN, {
    polling: {
        interval: 300,
        autoStart: true,
        params: {
            timeout: 10
        }
    }
});

bot.on('message', msg => {
    // const html = `
    //     < h2 > < strong > Hello, $ {
    //         msg.from.first_name
    //     } < /strong></h2 >
    // `;

});