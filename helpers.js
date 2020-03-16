/*jshint esversion: 8*/

let db = require("./database.js");
const request = require("request");
const neatCsv = require("neat-csv");

function debug(obj = {}) {
  return JSON.stringify(obj, null, 4);
}

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

const close_txt = "Закрыть ❌";
const option_txt = "Настройки ⚙️";
const validation_txt = "Я могу быть заражен?🤧\nПроверить себя";
const inform_txt = "Ситуация коронавируса в Казахстане";
const faq = "Хочу узнать о коронавирусе";

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

function countOfCovidType(type, callback) {
  request({
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
          callback(null, {
            type: type,
            result: result
          });
        }
      }
    }
  );
}

module.exports = {
  debug,
  covid_symptoms,
  symptoms_number,
  cold_symptoms,
  flu_symptoms,
  close_txt,
  option_txt,
  validation_txt,
  inform_txt,
  faq,
  updateNotification,
  countOfCovidType
};