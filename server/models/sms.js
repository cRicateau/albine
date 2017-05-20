'use strict';

module.exports = function(Sms) {
  Sms.remoteMethod(
    'save',
    {
      http: { verb: 'post', path: '/save' },
      description: 'Create sms',
      accepts: [
        { arg: 'sms', type: 'number', required: true, root: true },
      ],
      returns: { type: 'object', root: true },
    }
  );

  Sms.save = function(sms) {
    return Sms.upsert(sms);
  };
};
