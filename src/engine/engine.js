/**
 * @fileoverview  This file contains the logic for interacting with the bot's
 *     state machine and exposes the methods required to do so. All interaction
 *     with the state machine should happen through this file.
 */
"use strict";
var Stately = require('stately.js');
var statelyConfig = require('./statelyConfig.js');
var STATES = require('./states.json');

const INITIAL_STATE = '1';
var bot;

/**
 * Reformats the bot's string response to and array of responses
 * @param  {string} botResponse the response from the bot state machine
 * @return {array}             An array of response strings
 */
function getMessagesToSend(responseKeysHash) {
  console.log(responseKeysHash);
  let responseKeys = JSON.parse(responseKeysHash);
  console.log(responseKeys);
  return responseKeys.map(responseKey => STATES[responseKey]);
}

/**
 * Runs one input through the bots' state machine and returns the responses.
 * @param  {string} message A message for the state machine - input.
 * @return {array}         An array of response strings
 */
function turn(message) {
  let responseKeysHash;
  console.log(message);
  if (message.reset === true) {
    bot = Stately.machine(statelyConfig, INITIAL_STATE).bind(function(event, oldState, newState) {
      this[newState].oldState = oldState;
    });
    responseKeysHash = bot.onEnter();
  } else {
    responseKeysHash = bot.onInput(message.body);
  }
  return getMessagesToSend(responseKeysHash);
}

module.exports = { turn };
