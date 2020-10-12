import {QEWD} from '../qewd-client.js';

document.addEventListener('DOMContentLoaded', () => {

  let loginForm = document.getElementById('login-form');
  let registerForm = document.getElementById('register-form');
  loginForm.style = 'display: none';
  registerForm.style = 'display: none';

  QEWD.on('ewd-registered', () => {

    QEWD.log = true;

    document.getElementById('registerLink').addEventListener('click', () => {
      loginForm.style = 'display: none';
      registerForm.style = 'display:';
    });

    document.getElementById('loginLink').addEventListener('click', () => {
      loginForm.style = 'display:';
      registerForm.style = 'display: none';
    });

    document.getElementById('registerBtn').addEventListener('click', async () => {
      let username = document.getElementById('new-username').value;
      if (!username || username === '') {
        alert('You must enter a username!');
        return;
      }
      let password = document.getElementById('new-password').value;
      if (!password || password === '') {
        alert('You must enter a password!');
        return;
      }
      let password2 = document.getElementById('new-password-2').value;
      if (!password2 || password2 === '') {
        alert('You must confirm the password!');
        return;
      }
      if (password !== password2) {
        alert('Passwords do not match!');
        return;
      }
      let responseObj = await QEWD.reply({
        type: 'register',
        username: username,
        password: password,
        password2: password2
      });
      if (responseObj.message.error) {
        alert(responseObj.message.error);
      }
      else {
        // user is logged in
        alert('You have successfully logged in');
      }
    });

    document.getElementById('loginBtn').addEventListener('click', async () => {
      let username = document.getElementById('username').value;
      if (!username || username === '') {
        alert('You must enter a username!');
        return;
      }
      let password = document.getElementById('password').value;
      if (!password || password === '') {
        alert('You must enter a password!');
        return;
      }
      let responseObj = await QEWD.reply({
        type: 'login',
        username: username,
        password: password
      });
      if (responseObj.message.error) {
        alert(responseObj.message.error);
      }
      else {
        // user is logged in
        loginForm.style = 'display: none';
        registerForm.style = 'display: none';
        alert('You have successfully logged in');
      }
    });

    loginForm.style = 'display:';
  });

  QEWD.start({
    application: 'helloworld'
  });
});
