"use strict";
const engine = require('./src/engine/engine.js');
const request = require('superagent');
const fbAccessToken = process.env.FB_ACCESS_TOKEN;
const fs = require('fs');


// Hack (Morgan), but a small one since the chat bot expects a reset on the
// first message
var isFirstMessage = true;


function handleMessageEvent(event) {
  let sender = event.sender.id;
  if (event.message && event.message.text) {
    let text = event.message.text;
    console.log('Text:', text);
    request.get('https://www.googleapis.com/language/translate/v2')
    .set({'Content-Type': 'charset=UTF-8'})
    .query({key: 'AIzaSyD88YmDJil9N_KTYjks1mDco1xEpGZ_ugs'})
    .query({source: 'zh-CN'})
    .query({target: 'en'})
    .query({q: text})
    .end((err, translation)=> {
      let translatedText = translation.body.data.translations;
      let message;

      if(translatedText.length > 0){
        message = {
          body: translatedText[0].translatedText
        }
      }else{
        message = {
          body: translatedText
        }
      }
      console.log(message);
      // let message = { body: text };
      if (isFirstMessage || translatedText === 'r') {
        message.reset = true;
        isFirstMessage = false;
      }
      let responses = engine.turn(message);
      if(typeof responses != 'undefined'){
        responses.forEach((response) => {
          sendMessage(sender, response);
        });
      }
    });
  }
}
function sendMessage(sender, message) {

  request.post('https://graph.facebook.com/v2.6/me/messages')
    .query({access_token: fbAccessToken})
    .send({
          recipient: {id: sender},
          message,
    })
    .end(callback);

  function callback (error, response) {
    if (error) {
      fs.writeFile('fb_log.json', JSON.stringify(error, null, '\t'), 'utf8', () => {});
    } else if (response.body.error) {
        console.warn('Error: ', response.body.error)
    }
  }
}

// function sendMessage(sender, message) {
//   var str;
//   console.log(message);
//   if(typeof message.attach == 'undefined'){
//     str = message.body
//   }else{
//     str = message.text
//   }
//   request.get('https://www.googleapis.com/language/translate/v2')
//   .set({'Content-Type': 'charset=UTF-8'})
//   .query({key: 'AIzaSyD88YmDJil9N_KTYjks1mDco1xEpGZ_ugs'})
//   .query({source: 'en'})
//   .query({target: 'zh-CN'})
//   .query({q: str})
//   .end((err, translation)=> {
//     console.log(translation.body);

//     let translatedText = translation.body.data.translations;
//     let message;

//     if(translatedText.length > 0){
//       message = {
//         text: translatedText[0].translatedText
//       }
//     }else{
//       message = {
//         text: translatedText
//       }
//     }
//     request.post('https://graph.facebook.com/v2.6/me/messages')
//       .query({access_token: fbAccessToken})
//       .send({
//             recipient: {id: sender},
//             message,
//       })
//       .end(callback);

//     function callback (error, response) {
//       if (error) {
//         fs.writeFile('fb_log.json', JSON.stringify(error, null, '\t'), 'utf8', () => {});
//       } else if (response.body.error) {
//           console.warn('Error: ', response.body.error)
//       }
//     }
//   })
// }

module.exports = handleMessageEvent;
