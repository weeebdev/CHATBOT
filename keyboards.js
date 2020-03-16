/*jshint esversion: 8*/

kb = require('./keyboard_buttons');
helpers = require('./helpers');
const kbo = kb.options;
const kbs = kb.symptoms;
const {
    close_txt,
    option_txt,
    validation_txt,
    inform_txt,
    faq
} = helpers;

module.exports = {
    q1A: [
        [{
                text: kbo.often,
                callback_data: JSON.stringify({
                    symptom: kbs.fever,
                    answer: kbo.often
                })
            },
            {
                text: kbo.rarely,
                callback_data: JSON.stringify({
                    symptom: kbs.fever,
                    answer: kbo.rarely
                })
            }
        ],
        [{
                text: kbo.typical,
                callback_data: JSON.stringify({
                    symptom: kbs.fever,
                    answer: kbo.typical
                })
            },
            {
                text: kbo.no,
                callback_data: JSON.stringify({
                    symptom: kbs.fever,
                    answer: kbo.no
                })
            }
        ]
    ],
    q2A: [
        [{
                text: kbo.almost_always,
                callback_data: JSON.stringify({
                    symptom: kbs.cough,
                    answer: kbo.almost_always
                })
            },
            {
                text: kbo.sometimes,
                callback_data: JSON.stringify({
                    symptom: kbs.cough,
                    answer: kbo.sometimes
                })
            }
        ],
        [{
                text: kbo.often_dry,
                callback_data: JSON.stringify({
                    symptom: kbs.cough,
                    answer: kbo.often_dry
                })
            },
            {
                text: kbo.no,
                callback_data: JSON.stringify({
                    symptom: kbs.cough,
                    answer: kbo.no
                })
            }
        ]

    ],
    q3A: [
        [{
                text: kbo.often,
                callback_data: JSON.stringify({
                    symptom: kbs.weakness,
                    answer: kbo.often
                })
            },
            {
                text: kbo.sometimes,
                callback_data: JSON.stringify({
                    symptom: kbs.weakness,
                    answer: kbo.sometimes
                })
            }
        ],
        [{
                text: kbo.typical,
                callback_data: JSON.stringify({
                    symptom: kbs.weakness,
                    answer: kbo.typical
                })
            },
            {
                text: kbo.no,
                callback_data: JSON.stringify({
                    symptom: kbs.weakness,
                    answer: kbo.no
                })
            }
        ]

    ],
    q4A: [
        [{
                text: kbo.maybe,
                callback_data: JSON.stringify({
                    symptom: kbs.shortness_of_breath,
                    answer: kbo.maybe
                })
            },
            {
                text: kbo.sometimes,
                callback_data: JSON.stringify({
                    symptom: kbs.shortness_of_breath,
                    answer: kbo.sometimes
                })
            }
        ],
        [{
                text: kbo.rarely,
                callback_data: JSON.stringify({
                    symptom: kbs.shortness_of_breath,
                    answer: kbo.rarely
                })
            },
            {
                text: kbo.no,
                callback_data: JSON.stringify({
                    symptom: kbs.shortness_of_breath,
                    answer: kbo.no
                })
            }
        ]

    ],
    q5A: [
        [{
                text: kbo.rarely,
                callback_data: JSON.stringify({
                    symptom: kbs.headache,
                    answer: kbo.rarely
                })
            },
            {
                text: kbo.sometimes,
                callback_data: JSON.stringify({
                    symptom: kbs.headache,
                    answer: kbo.sometimes
                })
            }
        ],
        [{
                text: kbo.often,
                callback_data: JSON.stringify({
                    symptom: kbs.headache,
                    answer: kbo.often
                })
            },
            {
                text: kbo.no,
                callback_data: JSON.stringify({
                    symptom: kbs.headache,
                    answer: kbo.no
                })
            }
        ]

    ],
    q6A: [
        [{
                text: kbo.rarely,
                callback_data: JSON.stringify({
                    symptom: kbs.body_aches,
                    answer: kbo.rarely
                })
            },
            {
                text: kbo.sometimes,
                callback_data: JSON.stringify({
                    symptom: kbs.body_aches,
                    answer: kbo.sometimes
                })
            }
        ],
        [{
                text: kbo.often,
                callback_data: JSON.stringify({
                    symptom: kbs.body_aches,
                    answer: kbo.often
                })
            },
            {
                text: kbo.no,
                callback_data: JSON.stringify({
                    symptom: kbs.body_aches,
                    answer: kbo.no
                })
            }
        ]

    ],
    q7A: [
        [{
                text: kbo.rarely,
                callback_data: JSON.stringify({
                    symptom: kbs.sore_throat,
                    answer: kbo.rarely
                })
            },
            {
                text: kbo.sometimes,
                callback_data: JSON.stringify({
                    symptom: kbs.sore_throat,
                    answer: kbo.sometimes
                })
            }
        ],
        [{
                text: kbo.often,
                callback_data: JSON.stringify({
                    symptom: kbs.sore_throat,
                    answer: kbo.often
                })
            },
            {
                text: kbo.no,
                callback_data: JSON.stringify({
                    symptom: kbs.sore_throat,
                    answer: kbo.no
                })
            }
        ]

    ],
    q8A: [
        [{
                text: kbo.rarely,
                callback_data: JSON.stringify({
                    symptom: kbs.chills,
                    answer: kbo.rarely
                })
            },
            {
                text: kbo.sometimes,
                callback_data: JSON.stringify({
                    symptom: kbs.chills,
                    answer: kbo.sometimes
                })
            }
        ],
        [{
                text: kbo.often,
                callback_data: JSON.stringify({
                    symptom: kbs.chills,
                    answer: kbo.often
                })
            },
            {
                text: kbo.no,
                callback_data: JSON.stringify({
                    symptom: kbs.chills,
                    answer: kbo.no
                })
            }
        ]
    ],
    q9A: [
        [{
                text: kbo.almost_no,
                callback_data: JSON.stringify({
                    symptom: kbs.runny_nose,
                    answer: kbo.almost_no
                })
            },
            {
                text: kbo.sometimes,
                callback_data: JSON.stringify({
                    symptom: kbs.runny_nose,
                    answer: kbo.sometimes
                })
            }
        ],
        [{
                text: kbo.often,
                callback_data: JSON.stringify({
                    symptom: kbs.runny_nose,
                    answer: kbo.often
                })
            },
            {
                text: kbo.no,
                callback_data: JSON.stringify({
                    symptom: kbs.runny_nose,
                    answer: kbo.no
                })
            }
        ]

    ],
    q10A: [
        [{
                text: kbo.rarely,
                callback_data: JSON.stringify({
                    symptom: kbs.sneezing,
                    answer: kbo.rarely
                })
            },
            {
                text: kbo.sometimes,
                callback_data: JSON.stringify({
                    symptom: kbs.sneezing,
                    answer: kbo.sometimes
                })
            }
        ],
        [{
                text: kbo.often,
                callback_data: JSON.stringify({
                    symptom: kbs.sneezing,
                    answer: kbo.often
                })
            },
            {
                text: kbo.no,
                callback_data: JSON.stringify({
                    symptom: kbs.sneezing,
                    answer: kbo.no
                })
            }
        ]

    ],
    faq1: [
        [kb.questions.what_is_corona],
        [kb.questions.what_is_cov],
        [kb.questions.how_virus],
        [kb.questions.next],
        ['Меню']
    ],
    faq2: [
        [kb.questions.air_virus],
        [kb.questions.no_symptoms_man],
        [kb.questions.shit_man],
        [kb.questions.how_to_defend],
        [kb.questions.back]
    ],
    menu: [
        [validation_txt],
        [inform_txt],
        [faq],
        [option_txt],
        [close_txt]
    ]
};