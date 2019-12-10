module.exports = function(messageObj, session, send, finished) {
  var id = session.data.$('id').value;
  var authDoc = this.documentStore.use('userAuth');
  authDoc.enable_kvs();
  authDoc.kvs.delete(id);
  finished({ok: true});
};
