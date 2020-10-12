module.exports = function(messageObj, session, send, finished) {
  if (!session.authenticated) {
    return finished({error: 'Invalid action: You are not logged in!'});
  }
  let username = messageObj.username;
  if (!username || username === '') {
    return finished({error: 'Missing username'});
  }
  let id = session.data.$('id').value;

  let authDoc = this.documentStore.use('userAuth');
  authDoc.enable_kvs();
  let data = authDoc.kvs.get_by_key(id);

  console.log(data);

  data.username = username;
  authDoc.kvs.edit(id, data);

  finished({ok: true});
};
