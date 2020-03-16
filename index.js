require("dotenv").config();
let db = require("./database.js");
const TelegramBot = require("node-telegram-bot-api");
const debug = require("./helpers");
const keyboards = require("./keyboards");
const kb = require("./keyboard_buttons");
const request = require("request");
const neatCsv = require("neat-csv");

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

const close_txt = "Закрыть ❌";
const option_txt = "Настройки ⚙️";
const validation_txt = "Я могу быть заражен?🤧\nПроверить себя";
const inform_txt = "Ситуация коронавируса в Казахстане";
const faq = "Хочу узнать о коронавирусе";

bot.on("message", msg => {
  const chatId = msg.chat.id;

  const user_id = msg.from.id;
  const chat_id = msg.chat.id;
  let { first_name, username } = msg.from;
  const date = msg.date;
  let userRef = db.collection("user_info").doc(String(user_id));
  let news_notification;
  let pharmacy_notification;

  switch (msg.text) {
    case "/start":
      bot.sendMessage(
        chatId,
        "Здравствуйте! Я бот, который поможет вам узнавать всю актульную информацию о COVID-19\nВсе уведомления по умолчанию включены.",
        {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "Перейти в меню",
                  callback_data: "menu_open"
                }
              ]
            ]
          }
        }
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
        'Начинаем диагностику...\nОтвечайте на вопросы только ответами, приведенными ниже\nЕсли вашего ответа нет, отвечайте "Нет"\nУ вас есть лихорадка?',
        {
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
            news_notification_option = [
              {
                text: "Выключить новости",
                callback_data: "news_notification_false"
              }
            ];
          } else {
            news_notification_option = [
              {
                text: "Включить новости",
                callback_data: "news_notification_true"
              }
            ];
          }

          if (pharmacy_notification) {
            pharmacy_notification_option = [
              {
                text: "Выключить уведомления nо повышении цен в аптеках",
                callback_data: "pharmacy_notification_false"
              }
            ];
          } else {
            pharmacy_notification_option = [
              {
                text: "Включить уведомления nо повышении цен в аптеках",
                callback_data: "pharmacy_notification_true"
              }
            ];
          }
          bot.sendMessage(chatId, "Настройки", {
            reply_markup: {
              inline_keyboard: [
                news_notification_option,
                pharmacy_notification_option,
                [
                  {
                    text: "Перейти в меню",
                    callback_data: "menu_open"
                  }
                ]
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
            [
              {
                text: "Количество людей с коронавирусом в Казахстане",
                callback_data: "covid_count_info"
              }
            ],
            [
              {
                text: "Перейти в меню",
                callback_data: "menu_open"
              }
            ]
          ]
        }
      });
      break;
    case kb.questions.back:
    case faq:
      bot.sendMessage(chatId, "Что вы хотите узнать?", {
        reply_markup: {
          keyboard: keyboards.faq1
        }
      });
      break;
    case "Меню":
    case "/menu":
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
      break;
    case kb.questions.next:
      bot.sendMessage(chatId, "Что вы хотите узнать?", {
        reply_markup: {
          keyboard: keyboards.faq2
        }
      });
      break;
    case kb.questions.what_is_corona:
      text = kb.replies.what_is_corona;
      bot.sendMessage(chatId, text, {
        parse_mode: "HTML"
      });
      break;
    case kb.questions.what_is_cov:
      text = kb.replies.what_is_cov;
      bot.sendMessage(chatId, text, {
        parse_mode: "HTML"
      });
      break;
    case kb.questions.what_symptoms:
      text = kb.replies.what_symptoms;
      bot.sendMessage(chatId, text, {
        parse_mode: "HTML"
      });
      break;
    case kb.questions.how_virus:
      text = kb.replies.how_virus;
      bot.sendMessage(chatId, text, {
        parse_mode: "HTML"
      });
      break;
    case kb.questions.air_virus:
      text = kb.replies.air_virus;
      bot.sendMessage(chatId, text, {
        parse_mode: "HTML"
      });
      break;
    case kb.questions.no_symptoms_man:
      text = kb.replies.no_symptoms_man;
      bot.sendMessage(chatId, text, {
        parse_mode: "HTML"
      });
      break;
    case kb.questions.shit_man:
      text = kb.replies.shit_man;
      bot.sendMessage(chatId, text, {
        parse_mode: "HTML"
      });
      break;
    case kb.questions.how_to_defend:
      text = kb.replies.how_to_defend;
      bot.sendMessage(chatId, text, {
        parse_mode: "HTML"
      });
      bot.sendMessage(
        chatId,
        "Соблюдая простые меры предосторожности, вы можете снизить риск заражения или распространения COVID‑19:<strong>Регулярно обрабатывайте руки спиртосодержащим средством или мойте их с мылом.</strong>Зачем это нужно? Если на поверхности рук присутствует вирус, то обработка рук спиртосодержащим средством или мытье их с мылом убьет его.<strong>Держитесь на расстоянии не менее одного метра от кашляющих или чихающих людей.</strong>Зачем это нужно? При кашле или чихании из носа или рта выделяются мельчайшие содержащие вирус капли, которые человек распространяет вокруг себя. Находясь слишком близко к такому человеку, вы рискуете вдохнуть эти капли и заразиться от него, в том числе коронавирусной инфекцией, если человек болен COVID-19.<strong>По возможности, не трогайте руками глаза, нос и рот.</strong>Зачем это нужно? Руки касаются многих поверхностей, и на них может попасть вирус. Оказавшись на руках, вирусные частицы могут попадать в глаза, нос или рот. С этих частей тела вирус может внедряться в организм и вызывать заболевание.<strong>Как вам, так и окружающим следует строго соблюдать правила респираторной гигиены.</strong>Для этого необходимо прикрывать рот или нос сгибом локтя или салфеткой при кашле или чихании. Использованную салфетку нужно сразу же выбросить.Зачем это нужно? Вирус передается через мелкие капли. Строго соблюдая правила респираторной гигиены, вы можете защитить окружающих от таких вирусных заболеваний, как ОРВИ, грипп и COVID-19. <strong>Если вы плохо себя чувствуете, оставайтесь дома.</strong>При повышении температуры, появлении кашля и затруднении дыхания как можно быстрее обращайтесь за медицинской помощью. Следуйте указаниям местных органов здравоохранения. Зачем это нужно? У центральных и местных органов здравоохранения имеется самая актуальная информация о ситуации в районе вашего проживания. Своевременное обращение за медицинской помощью позволит медицинским специалистам оперативно направить вас в подходящее лечебное учреждение. Кроме того, вы тем самым обезопасите себя и поможете предотвратить распространение вирусных и других инфекций. <strong>Следите за обновлением списка зон высокого риска по COVID‑19</strong>Следите за обновлением списка зон высокого риска по COVID‑19 (города или районы, в которых отмечено широкое распространение COVID‑19). По возможности воздержитесь от поездок, особенно если вы являетесь пожилым человеком или страдаете диабетом, заболеваниями сердца или легких. Зачем это нужно? В этих районах вы подвергнете себя повышенному риску заражения COVID‑19.",
        {
          parse_mode: "HTML"
        }
      );
      break;
  }
});

bot.on("callback_query", query => {
  const userId = query.from.id;
  const chatId = query.message.chat.id;
  // console.log(query);

  userRef = db.collection("user_info").doc(String(userId));

  switch (query.data) {
    case "menu_open":
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
      break;
    case "covid_count_info":
      let types = ["Confirmed", "Deaths", "Recovered"];
      let confirmed_count, death_count, recovered_count;
      for (let type in types) {
        countOfCovidType(types[type], function(err, res) {
          if (err) {
            console.log(err);
          } else {
            if (res.type == "Confirmed") {
              confirmed_count = res.result;
            } else if (res.type == "Deaths") {
              death_count = res.result;
            } else {
              recovered_count = res.result;
            }
            if (
              confirmed_count !== undefined &&
              death_count !== undefined &&
              recovered_count !== undefined
            ) {
              bot.sendMessage(
                chatId,
                `Количество зараженных: ${confirmed_count}\nКоличество выздоровевших: ${recovered_count}\nКоличество погибших: ${death_count}`
              );
            }
          }
        });
      }
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
              [
                {
                  text: "Включить новости",
                  callback_data: "news_notification_true"
                }
              ],
              [
                {
                  text: query.message.reply_markup.inline_keyboard[1][0].text,
                  callback_data:
                    query.message.reply_markup.inline_keyboard[1][0]
                      .callback_data
                }
              ],
              [
                {
                  text: "Перейти в меню",
                  callback_data: "menu_open"
                }
              ]
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
              [
                {
                  text: query.message.reply_markup.inline_keyboard[0][0].text,
                  callback_data:
                    query.message.reply_markup.inline_keyboard[0][0]
                      .callback_data
                }
              ],
              [
                {
                  text: "Включить уведомления по повышении цен в аптеках",
                  callback_data: "pharmacy_notification_true"
                }
              ],
              [
                {
                  text: "Перейти в меню",
                  callback_data: "menu_open"
                }
              ]
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
              [
                {
                  text: "Выключить новости",
                  callback_data: "news_notification_false"
                }
              ],
              [
                {
                  text: query.message.reply_markup.inline_keyboard[1][0].text,
                  callback_data:
                    query.message.reply_markup.inline_keyboard[1][0]
                      .callback_data
                }
              ],
              [
                {
                  text: "Перейти в меню",
                  callback_data: "menu_open"
                }
              ]
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
              [
                {
                  text: query.message.reply_markup.inline_keyboard[0][0].text,
                  callback_data:
                    query.message.reply_markup.inline_keyboard[0][0]
                      .callback_data
                }
              ],
              [
                {
                  text: "Выключить уведомления по повышении цен в аптеках",
                  callback_data: "pharmacy_notification_false"
                }
              ],
              [
                {
                  text: "Перейти в меню",
                  callback_data: "menu_open"
                }
              ]
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
      const { symptom, answer } = JSON.parse(query.data);
      // parse data into firebase
      switch (symptom) {
        case kb.symptoms.fever:
          userRef.set(
            {
              corona_test: {
                fever: answer
              }
            },
            {
              merge: true
            }
          );
          sendQuestion(chatId, kb.symptoms.cough, keyboards.q2A);
          break;
        case kb.symptoms.cough:
          userRef.set(
            {
              corona_test: {
                cough: answer
              }
            },
            {
              merge: true
            }
          );
          sendQuestion(chatId, kb.symptoms.weakness, keyboards.q3A);
          break;
        case kb.symptoms.weakness:
          userRef.set(
            {
              corona_test: {
                weakness: answer
              }
            },
            {
              merge: true
            }
          );
          sendQuestion(chatId, kb.symptoms.shortness_of_breath, keyboards.q4A);
          break;
        case kb.symptoms.shortness_of_breath:
          userRef.set(
            {
              corona_test: {
                shortness_of_breath: answer
              }
            },
            {
              merge: true
            }
          );
          sendQuestion(chatId, kb.symptoms.headache, keyboards.q5A);
          break;
        case kb.symptoms.headache:
          userRef.set(
            {
              corona_test: {
                headache: answer
              }
            },
            {
              merge: true
            }
          );
          sendQuestion(chatId, kb.symptoms.body_aches, keyboards.q6A);
          break;
        case kb.symptoms.body_aches:
          userRef.set(
            {
              corona_test: {
                body_aches: answer
              }
            },
            {
              merge: true
            }
          );
          sendQuestion(chatId, kb.symptoms.sore_throat, keyboards.q7A);
          break;
        case kb.symptoms.sore_throat:
          userRef.set(
            {
              corona_test: {
                sore_throat: answer
              }
            },
            {
              merge: true
            }
          );
          sendQuestion(chatId, kb.symptoms.chills, keyboards.q8A);
          break;
        case kb.symptoms.chills:
          userRef.set(
            {
              corona_test: {
                chills: answer
              }
            },
            {
              merge: true
            }
          );
          sendQuestion(chatId, kb.symptoms.runny_nose, keyboards.q9A);
          break;
        case kb.symptoms.runny_nose:
          userRef.set(
            {
              corona_test: {
                runny_nose: answer
              }
            },
            {
              merge: true
            }
          );
          sendQuestion(chatId, kb.symptoms.sneezing, keyboards.q10A);
          break;
        case kb.symptoms.sneezing:
          userRef.set(
            {
              corona_test: {
                sneezing: answer
              }
            },
            {
              merge: true
            }
          );

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
                symptoms_number}%\nВнимание, это всего лишь приблизительные результаты, мы настоятельно просим вас позвонить в скорую при подозрении на коронавирус!`,
              {
                reply_markup: {
                  inline_keyboard: [
                    [
                      {
                        text: "Перейти в меню",
                        callback_data: "menu_open"
                      }
                    ]
                  ]
                }
              }
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
function countOfCovidType(type, callback) {
  request(
    {
      url: `https://github.com/CSSEGISandData/COVID-19/raw/master/csse_covid_19_data/csse_covid_19_time_series/time_series_19-covid-${type}.csv`,
      method: "GET"
    },
    async (err, response, body) => {
      if (err) {
        console.error(err);
        console.log(response);
        return callback(err);
      } else {
        let result = await neatCsv(body);
        let index = result.find((elem, index, arr) => {
          if (elem["Country/Region"] == "Kazakhstan") {
            return index;
          }
        });

        if (index !== undefined) {
          let date = new Date();
          let yy = date.getFullYear() % 2000;
          let mm = date.getMonth() + 1;
          let dd = date.getDate();
          if (index[`${mm}/${dd}/${yy}`] !== undefined) {
            result = index[`${mm}/${dd}/${yy}`];
          } else {
            result = index[`${mm}/${dd - 1}/${yy}`];
          }
          // results.push_back(result_index);
          callback(null, { type: type, result: result });
        }
      }
    }
  );
}
