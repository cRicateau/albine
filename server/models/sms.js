'use strict';

module.exports = function(Sms) {
  Sms.remoteMethod(
    'save',
    {
      http: {verb: 'post', path: '/save'},
      description: 'Create sms',
      accepts: [
        {arg: 'From', type: 'string', required: true, root: true},
        {arg: 'Body', type: 'string', required: true, root: true},
        {arg: 'DateCreated', type: 'string', required: false, root: true},
      ],
      returns: {type: 'object', root: true},
    }
  );

  Sms.save = function(From, Body, DateCreated) {
    return Sms.upsert({
      sender: From,
      content: Body,
    });
  };
};