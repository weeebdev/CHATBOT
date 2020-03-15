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
bot.on("message", msg => {
  console.log(msg);
  const user_id = msg.from.id;
  const chat_id = msg.chat.id;
  const { first_name, username } = msg.from;
  const date = msg.date;

  let userRef = db.collection("user_info").doc(String(user_id));

  userRef
    .get()
    .then(snapshot => {
      if (!snapshot.exists) {
        userRef.set({
          user_id: user_id,
          chat_id: chat_id,
          first_name: first_name,
          username: username,
          date: new Date(date),
          news_notification: true,
          pharmacy_notification: true
        }).then(() => {
          console.log('User successfully added!');
        });
      } else {
        console.log("Already in database");
      }
    })
    .catch(err => {
      console.error(err);
    });
});
