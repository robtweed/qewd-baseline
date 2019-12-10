module.exports = function(messageObj, session, send, finished) {
  session.authenticated = false;
  finished({ok: true});
};
