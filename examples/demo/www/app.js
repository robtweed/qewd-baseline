        $(document).ready(function() {

          $('#login-form').hide();
          $('#register-form').hide();
          $('#change-form').hide();

          EWD.on('ewd-registered', function() {
            EWD.log = true;

            $('#registerLink').on('click', function(e) {
              $('#login-form').hide();
              $('#register-form').show();
              $('#change-form').hide();
            }); 

            $('#loginLink').on('click', function(e) {
              $('#login-form').show();
              $('#register-form').hide();
              $('#change-form').hide();
            });

            $('#deregisterLink').on('click', function(e) {
              EWD.send({
                type: 'deregister'
              }, function(responseObj) {
                // user is logged out
                // reload the page to start a new session
                location.reload();
              });
            });

            $('#logoutLink').on('click', function(e) {
              EWD.send({
                type: 'logout'
              }, function(responseObj) {
                // user is logged out
                // reload the page to start a new session
                location.reload();
              });
            });

            $('#registerBtn').on('click', function(e) {
              var username = $('#new-username').val();
              if (!username || username === '') {
                alert('You must enter a username!');
                return;
              }
              var password = $('#new-password').val();
              if (!password || password === '') {
                alert('You must enter a password!');
                return;
              }
              var password2 = $('#new-password-2').val();
              if (!password2 || password2 === '') {
                alert('You must confirm the password!');
                return;
              }
              if (password !== password2) {
                alert('Passwords do not match!');
                return;
              }
              EWD.send({
                type: 'register',
                username: username,
                password: password,
                password2: password2
              }, function(responseObj) {
                if (responseObj.message.error) {
                  alert(responseObj.message.error);
                }
                else {
                  // user is logged in
                  // now allow them to amend their details
                  $('#login-form').hide();
                  $('#register-form').hide();
                  $('#change-form').show();
                }
              });

            });

            $('#changeUsernameBtn').on('click', function(e) {
              var username = $('#change-username').val();
              if (!username || username === '') {
                alert('You must enter a new username!');
                return;
              }
              EWD.send({
                type: 'change_username',
                username: username
              }, function(responseObj) {
                if (responseObj.message.error) {
                  alert(responseObj.message.error);
                }
                else {
                  alert('Your username was successfully changed');
                  $('#login-form').hide();
                  $('#register-form').hide();
                  $('#change-form').show();
                }
              });

            });

            $('#changePasswordBtn').on('click', function(e) {
              var password_current = $('#change-password-current').val();
              if (!password_current || password_current === '') {
                alert('You must enter your current password!');
                return;
              }
              var password_new = $('#change-password').val();
              if (!password_new || password_new === '') {
                alert('You must enter your new password!');
                return;
              }
              var password_new2 = $('#change-password-2').val();
              if (!password_new2 || password_new2 === '') {
                alert('You must confirm your new password!');
                return;
              }
              if (password_new !== password_new2) {
                alert('Your new passwords do not match');
                return;
              }
              EWD.send({
                type: 'change_password',
                password_current: password_current,
                password_new: password_new,
                password_new2: password_new2
              }, function(responseObj) {
                if (responseObj.message.error) {
                  alert(responseObj.message.error);
                }
                else {
                  alert('Your password was successfully updated');
                  $('#login-form').hide();
                  $('#register-form').hide();
                  $('#change-form').show();
                }
              });

            });

            $('#loginBtn').on('click', function(e) {
              var username = $('#username').val();
              if (!username || username === '') {
                alert('You must enter a username!');
                return;
              }
              var password = $('#password').val();
              if (!password || password === '') {
                alert('You must enter a password!');
                return;
              }
              EWD.send({
                type: 'login',
                username: username,
                password: password
              }, function(responseObj) {
                if (responseObj.message.error) {
                  alert(responseObj.message.error);
                }
                else {
                  // user is logged in
                  // now allow them to amend their details
                  $('#login-form').hide();
                  $('#register-form').hide();
                  $('#change-form').show();
                }
              });

            });

            $('#login-form').show();
          });

          EWD.start({
            application: 'helloworld',
            io: io
          });
        });
