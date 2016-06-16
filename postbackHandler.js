"use strict";
const engine = require('./src/engine/engine.js');
const request = require('superagent');
const fbAccessToken = process.env.FB_ACCESS_TOKEN;
const fs = require('fs');
const googleTranslate = require('google-translate')('AIzaSyD88YmDJil9N_KTYjks1mDco1xEpGZ_ugs');



function handlePostback(event) {
  let sender = event.sender.id;
  console.log(event.postback.payload);
  let responses = engine.turn( {body: event.postback.payload} );
  responses.forEach((response) => {
    sendMessage(sender, response);
  });
}

function sendMessage(sender, message) {

  googleTranslate.translate(message.body, 'zh-CN', function(err, translation) {
    let translatedText = translation.translatedText;

    console.log(translatedText);

      request.post('https://graph.facebook.com/v2.6/me/messages')
      .query({access_token: fbAccessToken})
      .send({
            recipient: {id: sender},
            {body: translatedText},
      })
      .end(callback);
    // =>  { translatedText: 'Hallo', originalText: 'Hello', detectedSourceLanguage: 'en' }
  });



  function callback (error, response) {
    if (error) {
      fs.writeFile('fb_log.json', JSON.stringify(error, null, '\t'), 'utf8', () => {});
    } else if (response.body.error) {
        console.warn('Error: ', response.body.error)
    }
  }
}

module.exports = handlePostback;
