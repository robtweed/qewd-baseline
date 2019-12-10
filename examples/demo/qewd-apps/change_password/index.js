module.exports = function(messageObj, session, send, finished) {
  if (!session.authenticated) {
    return finished({error: 'Invalid action: You are not logged in!'});
  }
  var password_current = messageObj.password_current;
  if (!password_current || password_current === '') {
    return finished({error: 'Missing current password'});
  }
  var password = messageObj.password_new;
  if (!password || password === '') {
    return finished({error: 'Missing new password'});
  }
  var password2 = messageObj.password_new2;
  if (!password2 || password2 === '') {
    return finished({error: 'Missing password confirmation'});
  }
  if (password !== password2) {
    return finished({error: 'New passwords do not match'});
  }
  if (password.length < 6) {
    return finished({error: 'Password must be 6 or more characters'});
  }
  var id = session.data.$('id').value;

  var authDoc = this.documentStore.use('userAuth');
  authDoc.enable_kvs();
  var data = authDoc.kvs.get_by_key(id);

  if (data.password !== password_current) {
    return finished({error: 'Your current password was not entered correctly'});
  }

  data.password = password;
  authDoc.kvs.edit(id, data);

  finished({ok: true});
};
