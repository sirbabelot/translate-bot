"use strict";
/**
 * @fileoverview This file stores the configuration object required for
 *     Stately.js. It represents the state machine that composes the bot.
 */
var regex = require('./regex.js');
var STATES = require('./states.json');
var State = require('./State.js');

var room_price, room_num;

function getResponsesByKeys(responses) {
  return responses.map(response => STATES[response]);
}

module.exports = {
  "GREETING": new State({
    onEnter: function() {
      return 'GREETING';
    },
    onInput: function(message) {
      if (message.search(regex.yes) >= 0) {
        return ['GROUP_MYSELF', JSON.stringify(['GROUP_MYSELF'])];
      } else if (message.search(regex.no) >= 0) {
        return ['NO_HELP', JSON.stringify(['NO_HELP'])];
      } else {
        return ['GREETING', JSON.stringify(['I_DONT_UNDERSTAND', 'GREETING']) ];
      }
    }
  }),
  "GROUP_MYSELF": new State({
    onEnter: function() {
    },
    onInput: function(message) {
      if (message === 'group') {
        return ['NUM_OF_ROOMS', JSON.stringify(['NUM_OF_ROOMS']) ]
      } else if (message === 'by myself') {
        return ['MAX_PRICE', JSON.stringify(['MAX_PRICE']) ]
      } else {
        return ['NUM_OF_ROOMS', JSON.stringify(['I_DONT_UNDERSTAND', 'GROUP_MYSELF'])];
      }
    }
  }),
  // "MALE_OR_FEMALE": new State({
  //   onEnter: function() {
  //   },
  //   onInput: function(message) {
  //     if (message === 'male' || message === 'female') {
  //       return ['MAX_PRICE', JSON.stringify(['MAX_PRICE'])]
  //     } else {
  //       return ['MALE_OR_FEMALE', JSON.stringify(['I_DONT_UNDERSTAND', 'MALE_OR_FEMALE'])];
  //     }
  //   }
  // }),
  "NUM_OF_ROOMS": new State({
    onEnter: function() {
    },
    onInput: function(message) {
      var matches = message.match(regex.num_range);
      if (matches && matches.length > 0) {
        room_num = matches[0];
        return ['MAX_PRICE', JSON.stringify(['MAX_PRICE'])]
      }
      else { return ['NUM_OF_ROOMS', JSON.stringify(['I_DONT_UNDERSTAND', 'NUM_OF_ROOMS'])]; }
    }
  }),
  "MAX_PRICE": new State({
    onEnter: function() {
    },
    onInput: function(message) {

      var matches = message.match(regex.price);
      if (matches && matches.length > 0) {
        room_price = matches[0];
        return ['ANYTHING_ELSE', JSON.stringify(['ANYTHING_ELSE'])];
      } else {
        return ['MAX_PRICE', JSON.stringify(['I_DONT_UNDERSTAND', 'MAX_PRICE']) ];
      }
    }
  }),
  "ANYTHING_ELSE": new State({
    onEnter: function() {
    },
    onInput: function(message) {
      // anything_else = message;
      // var newStr = STATES.LOOK_INTO_IT
      //   .replace('{room_num}', room_num)
      //   .replace('{room_price}', room_price);
      return ['LOOK_INTO_IT', JSON.stringify(['LOOK_INTO_IT', 'RESULT']) ]
    }
  }),
  "LOOK_INTO_IT": new State({
    onEnter: function() {
      return ['YOU_AGAIN', JSON.stringify(['YOU_AGAIN']) ]
    },
    onInput: function(message) {
      return ['CONTACT', JSON.stringify(['CONTACT'])]
    }
  }),
  "CONTACT": new State({
    onInput: function(message) {
      if (message.search(regex.schedule_listing) >= 0) {
        return ['CONTACT', JSON.stringify(['CONTACT'])];
      }
    }
  }),
  "YOU_AGAIN": new State({
    onEnter: function() {
    },
    onInput: function(message) {
      if (message.search(regex.yes) >= 0) {
        return ['GROUP_MYSELF', JSON.stringify(['GROUP_MYSELF']) ];
      } else if (message.search(regex.no) >= 0) {
        return ['NO_HELP', JSON.stringify(['NO_HELP'])];
      } else {
        return ['YOU_AGAIN', JSON.stringify(['I_DONT_UNDERSTAND', 'YOU_AGAIN'])];
      }
    }
  }),
  "NO_HELP": new State({
    onEnter: function() {
    },
    onInput: function(message) {
      return ['YOU_AGAIN', JSON.stringify(['YOU_AGAIN']) ]
    }
  })
};
