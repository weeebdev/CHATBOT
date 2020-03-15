kb = require('./keyboard_buttons');
const kbo = kb.options;
const kbs = kb.symptoms;

module.exports = {
    q1A: [
        [{
                text: kbo.often,
                callback_data: `${kbs.fever}_${kbo.}`
            },
            {
                text: kbo.rarely,
                callback_data: `${kbs.fever}_${kbo.}`
            }
        ],
        [kb.]
    ]
}