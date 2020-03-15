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
                            callback_data: 'news_notification_false'
                        }],
                        [{
                            text: 'Выключить уведомления\nо повышении цен в аптеках',
                            callback_data: 'pharmacy_notification_false'
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
            // Получить инфу с дб о нотификациях
            // и в зависимости от этого делать дальше
            let news_notification_option = [];
            let pharmacy_notification_option = [];
            if (news_notification) {
                news_notification_option = [{
                    text: 'Выключить новости',
                    callback_data: 'news_notification_false'
                }];
            } else {
                news_notification_option = [{
                    text: 'Включить новости',
                    callback_data: 'news_notification_true'
                }];
            }

            if (pharmacy_notification) {
                pharmacy_notification_option = [{
                    text: 'Выключить уведомления\ nо повышении цен в аптеках',
                    callback_data: 'pharmacy_notification_false'
                }];
            } else {
                pharmacy_notification_option = [{
                    text: 'Включить уведомления\ nо повышении цен в аптеках',
                    callback_data: 'pharmacy_notification_true'
                }];
            }
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
    const userId = query.message.from.id;
    const chatId = query.message.chat.id;
    switch (query.data) {
        case 'news_notification_false':
            // set to false
            bot.sendMessage(chatId, 'Уведомления о новостях выключены')
            break;
        case 'pharmacy_notification_false':
            // set to false
            bot.sendMessage(chatId, 'Уведомления о повышении цен в аптеках выключены')
            break;
        case 'news_notification_true':
            // set to true
            bot.sendMessage(chatId, 'Уведомления о новостях включены')
            break;
        case 'pharmacy_notification_true':
            // set to true
            bot.sendMessage(chatId, 'Уведомления о повышении цен в аптеках включены')
            break;
        default:
            console.error('???');
            break;
    }
});