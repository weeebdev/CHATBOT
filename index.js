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
    const chatId = msg.chat.id;

    const close_txt = 'Закрыть ❌';
    const option_txt = 'Настройки ⚙️';
    const validation_txt = 'Я могу быть заражен?🤧\nПроверить себя';
    switch (msg.text) {
        case '/start':
            bot.sendMessage(chatId, 'Здравствуйте! Я бот, который поможет вам узнавать всю актульную информацию о COVID-19\nВсе уведомления по умолчанию включены.', {
                reply_markup: {
                    inline_keyboard: [
                        [{
                            text: 'Выключить новости',
                            callback_data: '1'
                        }],
                        [{
                            text: 'Выключить уведомления\nо повышении цен в аптеках',
                            callback_data: '2'
                        }]
                    ]
                }
            });
            var data = {
                chat_id: undefined,
                date: new Date(),
                first_name: undefined,
                user_id: undefined,
                username: undefined,
                news_notification: true,
                pharmacy_notification: true
            };
            //Потом исправите
            data.chat_id = chatId;
            data.date = new Date();
            data.first_name = msg.from.first_name;
            data.user_id = msg.from.id;
            data.username = msg.from.username;
            console.log(data);
            break;
            // case '/show_info':
            //     bot.sendMessage(chatId, debug(data));
            //     break;
        case close_txt:
            bot.sendMessage(chatId, 'Закрыто', {
                reply_markup: {
                    remove_keyboard: true
                }
            });
            break;
        case validation_txt:
            break;
        case option_txt:
            break;
        default:
            bot.sendMessage(chatId, 'Выберите действие', {
                reply_markup: {
                    keyboard: [
                        [validation_txt],
                        [option_txt],
                        [close_txt]
                    ],
                    one_time_keyboard: true
                }
            });
    }

});

bot.on('callback_query', query => {
    bot.sendMessage(query.message.chat.id, debug(query));
});