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
    // Create a tweet in the database
    return Sms.app.models.Tweet.upsert({
      sender: From,
      content: Body,
    });
  };

  Sms.remoteMethod(
    'display',
    {
      http: {verb: 'get', path: '/display'},
      description: 'Create sms',
      returns: {type: 'object', root: true},
    }
  );

  Sms.display = function() {
    // Search in Loopback documentation to know how to query the db

    const tweetPromise = Sms.app.models.Tweet.find({
      limit: 5
    });

    const modePromise = Sms.app.models.Mode.find();
    const votePromise = Sms.app.models.Vote.find();

    return Promise.all([tweetPromise, modePromise, votePromise])
    .then(results => {

      // Transform ORM object to pure javascript to be able to edit them
      const tweets = JSON.parse(JSON.stringify(results[0]));
      const modes = JSON.parse(JSON.stringify(results[1]));
      const votes = JSON.parse(JSON.stringify(results[2]));
      const voteAlbert = _.sum(votes, 'albert')
      const votePauline = _.sum(votes, 'pauline')

      const mode = modes.length > 0 ? modes[0].mode : null;

      return {
        tweets: tweets,
        mode: mode,
        voteAlbert: voteAlbert,
        votePauline: votePauline
      }
    });
  };
};
