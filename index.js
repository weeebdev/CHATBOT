require("dotenv").config();
let db = require("./database.js");
const TelegramBot = require("node-telegram-bot-api");
const debug = require("./helpers");
const keyboards = require("./keyboards");
const kb = require("./keyboard_buttons");

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

const covid_symptoms = {
  fever: "Часто",
  cough: "Почти всегда",
  weakness: "Часто",
  shortness_of_breath: "Может быть",
  headache: "Редко",
  body_aches: "Редко",
  sore_throat: "Редко",
  chills: "Редко",
  runny_nose: "Практически нет",
  sneezing: "Не характерно"
};

const symptoms_number = Object.keys(covid_symptoms).length;

const cold_symptoms = {
  fever: "Редко",
  cough: "Иногда",
  weakness: "Иногда",
  shortness_of_breath: "Нет",
  headache: "Редко",
  body_aches: "Иногда",
  sore_throat: "Часто",
  chills: "Редко",
  runny_nose: "Часто",
  sneezing: "Часто"
};

const flu_symptoms = {
  fever: "Характерно",
  cough: "Часто, сухой",
  weakness: "Характерно",
  shortness_of_breath: "Нет",
  headache: "Часто",
  body_aches: "Часто",
  sore_throat: "Иногда",
  chills: "Часто",
  runny_nose: "Иногда",
  sneezing: "Иногда"
};

console.log("Бот успешно запущен!");

bot.on("message", msg => {
  const chatId = msg.chat.id;

  const close_txt = "Закрыть ❌";
  const option_txt = "Настройки ⚙️";
  const validation_txt = "Я могу быть заражен?🤧\nПроверить себя";
  const inform_txt = "Информация про коронавирус";
  const faq = "Хочу узнать о коронавирусе";

  const user_id = msg.from.id;
  const chat_id = msg.chat.id;
  let {
    first_name,
    username
  } = msg.from;
  const date = msg.date;
  let userRef = db.collection("user_info").doc(String(user_id));
  let news_notification;
  let pharmacy_notification;

  switch (msg.text) {
    case "/start":
      bot.sendMessage(
        chatId,
        "Здравствуйте! Я бот, который поможет вам узнавать всю актульную информацию о COVID-19\nВсе уведомления по умолчанию включены."
        // , {
        //   reply_markup: {
        //     inline_keyboard: [
        //       [{
        //         text: "Выключить новости",
        //         callback_data: "news_notification_false"
        //       }],
        //       [{
        //         text: "Выключить уведомления\nо повышении цен в аптеках",
        //         callback_data: "pharmacy_notification_false"
        //       }]
        //     ]
        //   }
        // }
      );

      if (username === undefined) {
        username = null;
      }

      // bot.sendMessage(chatId, debug(msg));

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
                pharmacy_notification: true,
                corona_test: {
                  fever: null,
                  cough: null,
                  weakness: null,
                  shortness_of_breath: null,
                  headache: null,
                  body_aches: null,
                  sore_throat: null,
                  chills: null,
                  runny_nose: null,
                  sneezing: null
                }
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
    case close_txt:
      bot.sendMessage(chatId, "Закрыто", {
        reply_markup: {
          remove_keyboard: true
        }
      });
      break;
    case "/test":
    case validation_txt:
      bot.sendMessage(
        chatId,
        'Начинаем диагностику...\nОтвечайте на вопросы только ответами, приведенными ниже\nЕсли вашего ответа нет, отвечайте "Нет"\nУ вас есть лихорадка?', {
          reply_markup: {
            inline_keyboard: keyboards.q1A
          }
        }
      );
      break;
    case "/options":
    case option_txt:
      // Получить инфу с дб о нотификациях
      // и в зависимости от этого делать дальше
      try {
        updateNotification(user_id).then(result => {
          news_notification = result.news_notification;
          pharmacy_notification = result.pharmacy_notification;
          let news_notification_option = [];
          let pharmacy_notification_option = [];

          // console.log(news_notification);
          // console.log(pharmacy_notification);

          if (news_notification) {
            news_notification_option = [{
              text: "Выключить новости",
              callback_data: "news_notification_false"
            }];
          } else {
            news_notification_option = [{
              text: "Включить новости",
              callback_data: "news_notification_true"
            }];
          }

          if (pharmacy_notification) {
            pharmacy_notification_option = [{
              text: "Выключить уведомления nо повышении цен в аптеках",
              callback_data: "pharmacy_notification_false"
            }];
          } else {
            pharmacy_notification_option = [{
              text: "Включить уведомления nо повышении цен в аптеках",
              callback_data: "pharmacy_notification_true"
            }];
          }
          bot.sendMessage(chatId, "Настройки", {
            reply_markup: {
              inline_keyboard: [
                news_notification_option,
                pharmacy_notification_option
              ]
            }
          });
        });
      } catch (err) {
        console.log(err);
      }

      break;

    case "/information":
    case inform_txt:
      bot.sendMessage(chatId, "Что вы хотите узнать?", {
        reply_markup: {
          inline_keyboard: [
            [{
              text: "Количество людей с коронавирусом в Казахстане",
              callback_data: "covid_count_info"
            }]
          ]
        }
      });
      break;
    case faq:
      bot.sendMessage(chatId, "Что вы хотите узнать?", {
        reply_markup: {
          keyboard: keyboards.faq
        }
      });
      break;
    case "/menu":
    default:
      bot.sendMessage(chatId, "Выберите действие", {
        reply_markup: {
          keyboard: [
            [validation_txt],
            [option_txt],
            [inform_txt],
            [faq],
            [close_txt]
          ],
          one_time_keyboard: true
        }
      });
  }
});

bot.on("callback_query", query => {
  const userId = query.from.id;
  const chatId = query.message.chat.id;
  // console.log(query);

  userRef = db.collection("user_info").doc(String(userId));

  switch (query.data) {
    case "covid_count_info":
      let confirmed = 9;
      let deaths = 0;
      let recovered = 0;
      bot.sendMessage(
        chatId,
        `Количество зараженных: ${confirmed}\nКоличество выздоровевших: ${recovered}\nКоличество погибших: ${deaths}`
      );
      break;
    case "news_notification_false":
      // set to false
      userRef
        .update({
          news_notification: false
        })
        .then(() => {
          console.log("News notification option updated to false");
          inline_keyboard_markup = {
            inline_keyboard: [
              [{
                text: "Включить новости",
                callback_data: "news_notification_true"
              }],
              [{
                text: query.message.reply_markup.inline_keyboard[1][0].text,
                callback_data: query.message.reply_markup.inline_keyboard[1][0]
                  .callback_data
              }]
            ]
          };
          bot.editMessageReplyMarkup(inline_keyboard_markup, {
            message_id: query.message.message_id,
            chat_id: query.message.chat.id,
            reply_markup: inline_keyboard_markup
          });
        })
        .catch(error => {
          console.error(error);
        });
      break;
    case "pharmacy_notification_false":
      // set to false
      userRef
        .update({
          pharmacy_notification: false
        })
        .then(() => {
          console.log("Pharmacy notification option updated to false");
          inline_keyboard_markup = {
            inline_keyboard: [
              [{
                text: query.message.reply_markup.inline_keyboard[0][0].text,
                callback_data: query.message.reply_markup.inline_keyboard[0][0]
                  .callback_data
              }],
              [{
                text: "Включить уведомления по повышении цен в аптеках",
                callback_data: "pharmacy_notification_true"
              }]
            ]
          };
          bot.editMessageReplyMarkup(inline_keyboard_markup, {
            message_id: query.message.message_id,
            chat_id: query.message.chat.id,
            reply_markup: inline_keyboard_markup
          });
        })
        .catch(error => {
          console.error(error);
        });
      break;
    case "news_notification_true":
      // set to true
      userRef
        .update({
          news_notification: true
        })
        .then(() => {
          console.log("News notification option updated to true");
          inline_keyboard_markup = {
            inline_keyboard: [
              [{
                text: "Выключить новости",
                callback_data: "news_notification_false"
              }],
              [{
                text: query.message.reply_markup.inline_keyboard[1][0].text,
                callback_data: query.message.reply_markup.inline_keyboard[1][0]
                  .callback_data
              }]
            ]
          };
          bot.editMessageReplyMarkup(inline_keyboard_markup, {
            message_id: query.message.message_id,
            chat_id: query.message.chat.id,
            reply_markup: inline_keyboard_markup
          });
        })
        .catch(error => {
          console.error(error);
        });
      break;
    case "pharmacy_notification_true":
      // set to true
      userRef
        .update({
          pharmacy_notification: true
        })
        .then(() => {
          console.log("Pharmacy notification option updated to true");
          inline_keyboard_markup = {
            inline_keyboard: [
              [{
                text: query.message.reply_markup.inline_keyboard[0][0].text,
                callback_data: query.message.reply_markup.inline_keyboard[0][0]
                  .callback_data
              }],
              [{
                text: "Выключить уведомления по повышении цен в аптеках",
                callback_data: "pharmacy_notification_false"
              }]
            ]
          };
          bot.editMessageReplyMarkup(inline_keyboard_markup, {
            message_id: query.message.message_id,
            chat_id: query.message.chat.id,
            reply_markup: inline_keyboard_markup
          });
        })
        .catch(error => {
          console.error(error);
        });
      break;
    default:
      const {
        symptom, answer
      } = JSON.parse(query.data);
      // parse data into firebase
      switch (symptom) {
        case kb.symptoms.fever:
          userRef.set({
            corona_test: {
              fever: answer
            }
          }, {
            merge: true
          });
          sendQuestion(chatId, kb.symptoms.cough, keyboards.q2A);
          break;
        case kb.symptoms.cough:
          userRef.set({
            corona_test: {
              cough: answer
            }
          }, {
            merge: true
          });
          sendQuestion(chatId, kb.symptoms.weakness, keyboards.q3A);
          break;
        case kb.symptoms.weakness:
          userRef.set({
            corona_test: {
              weakness: answer
            }
          }, {
            merge: true
          });
          sendQuestion(chatId, kb.symptoms.shortness_of_breath, keyboards.q4A);
          break;
        case kb.symptoms.shortness_of_breath:
          userRef.set({
            corona_test: {
              shortness_of_breath: answer
            }
          }, {
            merge: true
          });
          sendQuestion(chatId, kb.symptoms.headache, keyboards.q5A);
          break;
        case kb.symptoms.headache:
          userRef.set({
            corona_test: {
              headache: answer
            }
          }, {
            merge: true
          });
          sendQuestion(chatId, kb.symptoms.body_aches, keyboards.q6A);
          break;
        case kb.symptoms.body_aches:
          userRef.set({
            corona_test: {
              body_aches: answer
            }
          }, {
            merge: true
          });
          sendQuestion(chatId, kb.symptoms.sore_throat, keyboards.q7A);
          break;
        case kb.symptoms.sore_throat:
          userRef.set({
            corona_test: {
              sore_throat: answer
            }
          }, {
            merge: true
          });
          sendQuestion(chatId, kb.symptoms.chills, keyboards.q8A);
          break;
        case kb.symptoms.chills:
          userRef.set({
            corona_test: {
              chills: answer
            }
          }, {
            merge: true
          });
          sendQuestion(chatId, kb.symptoms.runny_nose, keyboards.q9A);
          break;
        case kb.symptoms.runny_nose:
          userRef.set({
            corona_test: {
              runny_nose: answer
            }
          }, {
            merge: true
          });
          sendQuestion(chatId, kb.symptoms.sneezing, keyboards.q10A);
          break;
        case kb.symptoms.sneezing:
          userRef.set({
            corona_test: {
              sneezing: answer
            }
          }, {
            merge: true
          });

          let covid_score = 0;
          let cold_score = 0;
          let flu_score = 0;

          console.log(userId);
          userRef = db.collection("user_info").doc(String(userId));
          userRef.get().then(snapshot => {
            let test_results = snapshot.data().corona_test;
            for (let key in test_results) {
              if (covid_symptoms[key] == test_results[key]) {
                covid_score++;
              }
              if (cold_symptoms[key] == test_results[key]) {
                cold_score++;
              }
              if (flu_symptoms[key] == test_results[key]) {
                flu_score++;
              }
            }

            bot.sendMessage(
              chatId,
              `Ниже приведены результаты теста:\nКоронавирус: ${(covid_score *
                100) /
                symptoms_number}%\nПростуда: ${(cold_score * 100) /
                symptoms_number}%\nГрипп: ${(flu_score * 100) /
                symptoms_number}%\nВнимание, это всего лишь приблизительные результаты, мы настоятельно просим вас позвонить в скорую при подозрении на коронавирус!`
            );
          });

          // end
          break;
        default:
          break;
      }
      break;
  }
});

async function updateNotification(user_id) {
  userRef = db.collection("user_info");
  let news_notification, pharmacy_notification;
  docSnapshot = await userRef.doc(String(user_id)).get();

  if (docSnapshot.exists) {
    news_notification = docSnapshot.data().news_notification;
    pharmacy_notification = docSnapshot.data().pharmacy_notification;
  }

  return {
    news_notification,
    pharmacy_notification
  };
}

function sendQuestion(chatId, symptom, question) {
  bot.sendMessage(chatId, `У вас есть ${symptom}?`, {
    reply_markup: {
      inline_keyboard: question
    }
  });
}