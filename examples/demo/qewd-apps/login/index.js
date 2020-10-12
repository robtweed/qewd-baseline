let isEmpty = require('../../../utils/isEmpty');

module.exports = function(messageObj, session, send, finished) {
  if (session.authenticated) {
    return finished({error: 'Invalid action: You are already logged in!'});
  }
  let username = messageObj.username;
  if (!username || username === '') {
    return finished({error: 'Missing username'});
  }
  let password = messageObj.password;
  if (!password || password === '') {
    return finished({error: 'Missing password'});
  }
  let authDoc = this.documentStore.use('userAuth');
  authDoc.enable_kvs();
  let matches = authDoc.kvs.get_by_index('username', username, true)
  if (isEmpty(matches)) {
    return finished({error: 'Invalid login attempt (0)'});
  }
  let authDetails;
  let id;
  for (id in matches) {
    authDetails = matches[id];
    break;
  }
  if (authDetails.password !== password) {
    return finished({error: 'Invalid login attempt (1)'});
  }

  session.data.$('id').value = id;
  session.authenticated = true;
  finished({ok: true});
};
