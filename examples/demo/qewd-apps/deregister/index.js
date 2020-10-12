module.exports = function(messageObj, session, send, finished) {
  let id = session.data.$('id').value;
  let authDoc = this.documentStore.use('userAuth');
  authDoc.enable_kvs();
  authDoc.kvs.delete(id);
  finished({ok: true});
};
