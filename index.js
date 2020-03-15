/* jshint esversion:6 */

require("dotenv").config();
let db = require("./database.js");
const TelegramBot = require("node-telegram-bot-api");
const debug = require("./helpers");

const TOKEN = process.env.TOKEN;

const bot = new TelegramBot(TOKEN, {
  polling: {
    interval: 300,
    autoStart: true,
    params: {
      timeout: 10
    }
  }
});

console.log("Бот успешно запущен!");

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

            const user_id = msg.from.id;
            const chat_id = msg.chat.id;
            const { first_name, username } = msg.from;
            const date = msg.date;

            userRef = db.collection('user_info').doc(String(user_id));

            userRef
              .get()
              .then(snapshot => {
                if (!snapshot.exists) {
                  userRef
                    .set({
                      user_id: user_id,
                      chat_id: chat_id,
                      first_name: first_name,
                      username: username,
                      date: new Date(date),
                      news_notification: true,
                      pharmacy_notification: true
                    })
                    .then(() => {
                      console.log("User successfully added!");
                    });
                } else {
                  console.log("Already in database");
                }
              })
              .catch(err => {
                console.error(err);
              });
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
