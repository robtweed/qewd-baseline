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
  let password2 = messageObj.password2;
  if (!password2 || password2 === '') {
    return finished({error: 'Missing password confirmation'});
  }
  if (password !== password2) {
    return finished({error: 'Passwords do not match'});
  }
  if (password.length < 6) {
    return finished({error: 'Password must be 6 or more characters'});
  }
  let authDoc = this.documentStore.use('userAuth');
  authDoc.enable_kvs();
  let arr = authDoc.kvs.getIndices();
  if (!authDoc.kvs.getIndices().includes('username')) {
    authDoc.kvs.addIndex('username');
  }
  if (authDoc.kvs.get_by_index('username', username)) {
    return finished({error: 'Username already in use'});
  }
  let id = authDoc.$('next_id').increment();
  authDoc.kvs.add(id, {
    username: username,
    password: password
  });

  session.authenticated = true;
  session.data.$('id').value = id;
  finished({ok: true});
};
