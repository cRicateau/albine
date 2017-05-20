'use strict';

const Promise = require('bluebird');
const _ = require('lodash');

module.exports = function(Sms) {
  Sms.remoteMethod(
    'save',
    {
      http: {verb: 'post', path: '/save'},
      description: 'Save tweet in DB',
      accepts: [
        {arg: 'From', type: 'string', required: true, root: true},
        {arg: 'Body', type: 'string', required: true, root: true},
      ],
      returns: {type: 'object', root: true},
    }
  );

  Sms.save = function(From, Body) {
    // Everyime a sms is send, it is received here

    // Create a tweet in the database
    return Sms.app.models.Tweet.create({
      sender: From,
      content: Body,
    });
  };

  // GET http://IP/api/sms/display
  Sms.remoteMethod(
    'display',
    {
      http: {verb: 'get', path: '/display'},
      description: 'Get relevant data',
      returns: {type: 'object', root: true},
    }
  );

  Sms.display = function() {
    // Search in Loopback documentation to know how to query the db


    // query all questions with a join ('include') of other models
    const questionsPromise = Sms.app.models.Question.find({
      include: ['modes', 'answers']
    });

    const tweetPromise = Sms.app.models.Tweet.find({
      limit: 10,
      order: 'id DESC'
    });

    const modePromise = Sms.app.models.Mode.find();
    const votePromise = Sms.app.models.Vote.find();

    return Promise.all([tweetPromise, modePromise, votePromise, questionsPromise])
    .then(results => {

      // Transform ORM object to pure javascript to be able to edit them
      const tweets = JSON.parse(JSON.stringify(results[0]));
      const modes = JSON.parse(JSON.stringify(results[1]));
      const votes = JSON.parse(JSON.stringify(results[2]));
      const questions = JSON.parse(JSON.stringify(results[3]));
      const voteAlbert = _.sumBy(votes, 'albert')
      const votePauline = _.sumBy(votes, 'pauline')

      const mode = modes.length > 0 ? modes[0].mode : null;

      return {
        tweets: tweets,
        mode: mode,
        voteAlbert: voteAlbert,
        votePauline: votePauline,
        questios: questions
      }
    });
  };
};
