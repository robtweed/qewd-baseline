# qewd-baseline: Developing Interactive Applications with QEWD
 
Rob Tweed <rtweed@mgateway.com>  
22 November 2019, M/Gateway Developments Ltd [http://www.mgateway.com](http://www.mgateway.com)  

Twitter: @rtweed

Google Group for discussions, support, advice etc: [http://groups.google.co.uk/group/enterprise-web-developer-community](http://groups.google.co.uk/group/enterprise-web-developer-community)

# Interactive QEWD Applications

In addition to supporting [REST APIs](./REST.md), QEWD supports interactive browser based 
and Native Mobile applications using WebSockets.  As with its REST API support, QEWD makes
it very quick and simple to develop such interactive, WebSocket-based applications.

QEWD interactive applications can use back-end maintained Sessions, with user authentication
based on an opaque, randomly-generated token (actually using the same process as can be used for
REST APIs).

The QEWD-baseline repository provides you with a configuration that is ready for you to adapt to
create your interactive applications.

# Hello World

Let's start in time-honoured fashion with a simple browser-based "Hello World" application.

For the purposes of simplicity and clarity, we won't make use of any fancy JavaScript frameworks,
but for the brevity of its syntax, we'll make use of jQuery.  Feel free to adapt the logic to
work with your favourite JavaScript framework.  I'll provide some tips along the way on a few things you'll
need to consider when using frameworks with QEWD.

As with the REST API examples, we'll make use of the [QEWD-Up](https://github.com/robtweed/qewd/blob/master/up/docs/InteractiveApps.md)
pattern of development.  

## Front-end

Let's start with the front-end for our *hello world* application, which will run in a browser.

We first need to decide on a name for our application.  The Application name is entirely up to you to
decide - any string value will do.  Let's call ours *helloworld*.

In the QEWD-baseline folder (I'll assume you installed it in *~/qewd-baseline*), you'll find
a sub-directory named *www*.  There's already the front-end for an application named *viewer*.  This
is automatically included for you in the repository.

Add a new subdirectory to the *~/qewd-baseline/www* directory, giving it the name we're going to
give our application, eg:

        cd ~/qewd-baseline/www
        mkdir helloworld
        cd helloworld

Now you need to create a simple HTML file which you should name *index.html*.  It should contain the
following:

        <!DOCTYPE html>
          <head>
            <title>QEWD WebSocket Application Demo</title> 
          </head> 
          <body>
            <script src="//ajax.googleapis.com/ajax/libs/jquery/2.2.0/jquery.min.js"></script>
            <script src="/socket.io/socket.io.js"></script>
            <script src="/ewd-client.js"></script>
            <script src="app.js"></script>
            <h3 id="header">
              QEWD WebSocket Application Demo
            </h3>
            <div id="content"></div>
          </body>
        </html>

Next, create a JavaScript file named *app.js* in the same directory, with the following content:


        $(document).ready(function() {
            EWD.on('ewd-registered', function() {
              EWD.log = true;
              $('#content').text('Hello World is ready for use!');
            });
          
          EWD.start({
            application: 'helloworld',
            io: io
          });
        });


When you've saved these files, open a browser window and enter the URL:

        http://xx.xx.xx.xx:8080/helloworld

Change the *xx*s for the IP address or domain name of the server you're using to host the QEWD 
Docker container.

You should see the following appear:

        QEWD WebSocket Application Demo

        Hello World is ready for use!


If you also open your browser's Development tools or JavaScript console, you should see the following
console log message:

        helloworld registered


## So What Just Happened?

What has happened is that you've created your first QEWD interactive application!  It currently doesn't
appear to do a great deal, but, behind the scenes, already a **lot** has happened, and it's ready for
you to build out using WebSocket messaging.

Let's break down the details of the key pieces that we put into the *index.html* and *app.js* files.

### index.html

The *index.html* file provides the markup for our *hello world* application.  Its main task is actually
to load the various JavaScript libraries that it needs:


This line loads jQuery from an online CDN source:

            <script src="//ajax.googleapis.com/ajax/libs/jquery/2.2.0/jquery.min.js"></script>

The next line loads the WebSocket client library - *socket-io* - from the QEWD server.  QEWD
comes with *socket-io* pre-installed and configured for you.  Always load it via the path shown:


            <script src="/socket.io/socket.io.js"></script>

The next line loads the QEWD Client JavaScript library from QEWD.  This is always pre-installed and
ready for use in QEWD:

            <script src="/ewd-client.js"></script>

The QEWD Client Library provides you with several key things:

- an automated mechanism via which your application will register itself with the QEWD back-end,
establishing the means by which the browser and QEWD back-end can securely communicate via
WebSocket messages.  This security is maintained via an opaque, randomly-generated token that is
known by and available to the browser and QEWD back-end.

- as part of the application registration process, QEWD will have established a Session.  This
Session may be used to maintain state information for the user of your application. Session State
storage is maintained using a [QEWD-JSdb](https://github.com/robtweed/qewd-jsdb) database.  The session is
uniquely identified and securely accessed via the token that is created during application registration.

- a *send* API via which you will be able to securely send WebSocket messages to the QEWD back-end, which
you handle using modules that you create and maintain.

You should **always** use the pre-built *ewd-client.js* library to interact with the QEWD back-end, 
regardless of the JavaScript framework you use in the browser.

Finally, this line loads our *app.js* library, which will define our application's dynamic behaviour:

            <script src="app.js"></script>


Notice also this line in the *index.html* file:

            <div id="content"></div>

This provides us with a tag into which we can dynamically create content in our web page.


### app.js

Now let's turn our attention to the *app.js* file.

It uses a jQuery event handler that is triggered once all the resources required by the browser
have loaded and initialised:

        $(document).ready(function() {

          // only do what's in here once the browser has loaded everything

        })

This ensures we don't end up with any race conditions or stuff trying to happen before the
JavaScript resources we need are fully in place and ready for use.

Next, we set up a special, QEWD-specific event handler that will fire once our application is ready
for use by the QEWD back-end:

            EWD.on('ewd-registered', function() {

              // Only do what's in here once the application has been registered with
              // the QEWD back-end, and QEWD is ready for use by your browser 

            });

Once again, this ensures that you don't inadvertently create race conditions and/or start trying
to interact with the QEWD back-end before it's ready for you.

Finally, we start up the QEWD Client in the browser:

          EWD.start({
            application: 'helloworld',
            io: io
          });

The object passed into the *EWD.start()* method as an argument specifies:

- the name of the application to register in the QEWD back-end (*helloworld* in our case)
- the *socket.io* object (*io*)


Invoking the QEWD Client *EWD.start()* method triggers a chain of events.  In summary:

- the browser establishes a Web-Socket connection with the QEWD back-end
- the browser sends a *register* WebSocket message to the QEWD back-end
- the QEWD back-end establishes a Session and generates a random, *uuid*-formatted token which
uniquely indentifies that Session
- the QEWD back-end sets up a QEWD-JSdb-based Session storage database and initialises it with
data it will subsequently need and use during later message exchange with the browser
- once the QEWD back-end is ready for use by the browser, the token is returned to the browser 
as the response to its original *register* message
- the browser saves the token securely and removes direct user access to the *socket-io* module 
(to prevent malicious attempts to hijack the WebSocket connection using the browser's development tools and/or
Javascript console)
- finally, the *ewd-registered* event is triggered to indicate that both the browser and back-end
are ready for WebSocket message interaction by the user.

When the browser receives the response from QEWD containing the Session Token, it triggers the console.log
command which generated this message:

        helloworld registered

The *ewd-registered* event triggered our event handler:


            EWD.on('ewd-registered', function() {
            });


and we dynamically generated the text inside the *index.html* file's *\<div id="content"\>* tag:

              $('#content').text('Hello World is ready for use!');

which is what we then saw in the browser.

Finally we also added this:

              EWD.log = true;

This will allow us to see the communication that takes place between the browser and the QEWD back-end
when we begin to send messages and receive responses.  Setting *EWD.log* to *true* is useful during
application development, but should be removed (to set *EWD.log* to its default *false* value)
in production applications.


### QEWD Activity

Let's also take a look at what happened in QEWD when you started the *helloworld* application
in your browser.

In a terminal session, start viewing the QEWD Console log:

        docker logs -f qewd

Now reload the *helloworld* page in your browser.  You should see something like this appear in the
QEWD log:

         Mon, 09 Dec 2019 12:13:55 GMT; worker 63 received message: {"type":"ewd-register",
        "application":"helloworld","jwt":false,"socketId":"1cqjrphUQDdSxhfgAAAL",
        "ipAddress":"::ffff:81.143.223.229"}
        
        Mon, 09 Dec 2019 12:13:55 GMT; master process received response from worker 63: 
       {"type":"ewd-register","finished":true,"message":{"token":"7a12ac69-d33e-45e3-8f49-1ebf80df8b95"}}

What you're seeing is the *ewd-register* message that was sent from your browser being received by
QEWD and passed to a Worker Process for handling.  You're then seeing the response from the Worker
Process being received by QEWD's Master Process, just before it then forwarded it to your browser.

The receipt of that response is what then triggered the *ewd-registered* event in your browser.


## Sending a WebSocket Message in the *helloworld* Application

Our *helloworld* application can now successfully start itself up, but it's not doing a great deal.

Let's see what's involved in:

- sending a WebSocket message to the QEWD back-end
- writing a handler module to process it
- returning the response back to the browser
- handling the response in the browser.

### Sending a WebSocket to the QEWD Back End

We'll do this simply, for now, using a button.  We'll hide the button initially, revealing it only
after the *ewd-registered* event has occurred.  Edit the *\<div id="content"\>* tag in the
 *index.html* file as follows:

            <button id="messageBtn">Send a message</button>
            <div id="content"></div>

and edit the *app.js* file as follows:

        $(document).ready(function() {
         
            $('#messageBtn').hide();            
             
            EWD.on('ewd-registered', function() {
              EWD.log = true;

              $('#messageBtn').on('click', function(e) {
                alert('about to send a message');
              });

              $('#messageBtn').show();
            });
          
          EWD.start({
            application: 'helloworld',
            io: io
          });
        });


Try reloading the *helloworld* page in your browser, and this time you'll see a *Send a message*
button.  Try clicking it and you'll see an alert.  Note how we didn't set up the button event
handler until the *ewd-registered* event had triggered.  This prevents the button being used
prematurely before the browser and QEWD back-end are ready.

OK so now we have the button working, let's
remove the alert from the button's event handler and make it send a WebSocket message to QEWD instead.
Change it in the *app.js* file to this:


              $('#messageBtn').on('click', function(e) {
                EWD.send({
                  type: 'hello'
                });
              });


Make sure you have a terminal window open viewing the QEWD console log, and ensure you've opened
the JavaScript console in your browser.

Reload the page in the browser again, and try clicking the button again.  This time you'll see a
burst of activity in both the browser's console and QEWD's console log.

The browser's JavaScript console should be showing something like this:

        sent: {"type":"hello"}
        
        ewd-client.js:181 received: {"type":"hello","finished":true,"message":
        {"error":"Unable to load handler module for: helloworld","reason":
        {"code":"MODULE_NOT_FOUND","requireStack":["/opt/qewd/node_modules/qewd/lib/appHandler.js",
        "/opt/qewd/node_modules/qewd/lib/worker.js","/opt/qewd/node_modules/qewd/lib/qewd.js",
        "/opt/qewd/node_modules/qewd/index.js","/opt/qewd/node_modules/ewd-qoper8/lib/worker/proto/init.js",
        "/opt/qewd/node_modules/ewd-qoper8/lib/ewd-qoper8.js","/opt/qewd/node_modules/ewd-qoper8/index.js",
        "/opt/qewd/node_modules/ewd-qoper8-worker.js"]}},"responseTime":"1ms"}


and the QEWD Console log will be showing something like this:


        Mon, 09 Dec 2019 12:37:40 GMT; worker 63 received message: 
        {"type":"hello","token":"f70ccbf2-457a-4ffc-b41d-a0b275f88db7"}
        
        Unable to load handler module for: helloworld: Error: Cannot find module 'helloworld'
         
        Require stack:
        - /opt/qewd/node_modules/qewd/lib/appHandler.js
        - /opt/qewd/node_modules/qewd/lib/worker.js
        - /opt/qewd/node_modules/qewd/lib/qewd.js
        - /opt/qewd/node_modules/qewd/index.js
        - /opt/qewd/node_modules/ewd-qoper8/lib/worker/proto/init.js
        - /opt/qewd/node_modules/ewd-qoper8/lib/ewd-qoper8.js
        - /opt/qewd/node_modules/ewd-qoper8/index.js
        - /opt/qewd/node_modules/ewd-qoper8-worker.js
        
        Mon, 09 Dec 2019 12:37:40 GMT; master process received response from worker 63: 
        {"type":"hello","finished":true,"message":{"error":"Unable to load handler module 
        for: helloworld","reason":{"code":"MODULE_NOT_FOUND","requireStack":[
        "/opt/qewd/node_modules/qewd/lib/appHandler.js","/opt/qewd/node_modules/qewd/lib/worker.js",
        "/opt/qewd/node_modules/qewd/lib/qewd.js","/opt/qewd/node_modules/qewd/index.js",
        "/opt/qewd/node_modules/ewd-qoper8/lib/worker/proto/init.js",
        "/opt/qewd/node_modules/ewd-qoper8/lib/ewd-qoper8.js","/opt/qewd/node_modules/ewd-qoper8/index.js",
        "/opt/qewd/node_modules/ewd-qoper8-worker.js"]}}}


So you can see from the browser's console that it sent a message:

        sent: {"type":"hello"}

and that QEWD received it:

        Mon, 09 Dec 2019 12:37:40 GMT; worker 63 received message: 
        {"type":"hello","token":"f70ccbf2-457a-4ffc-b41d-a0b275f88db7"}

Notice the token that was automatically added by the QEWD Client in the browser.

However, you'll see that QEWD generated an error:


        Unable to load handler module for: helloworld: Error: Cannot find module 'helloworld'

which is not surprising, since we haven't yet created a QEWD handler module for this message.

Anyway, what then happened was that QEWD generated an error response which was returned to
the browser, and you saw it logged in the browser's JavaScript console.  Let's take a look at the
structure of that error response:

        {
            "type": "hello",
            "finished": true,
            "message": {
                "error": "Unable to load handler module for: helloworld",
                "reason": {
                    "code": "MODULE_NOT_FOUND",
                    "requireStack": [... etc]
                }
            },
            "responseTime": "1ms"
        }

You'll find that all QEWD WebSocket response message objects will have a similar structure, containing
the 1st-level properties:

- type: matching the type of the message that was originally sent.  *type* is a reserved, mandatory
property in QEWD WebSocket messages
- finished: *true* if the handler module has finished its processing
- message: sub-object containing the response message payload.  If *message.error* is defined, then this
is an error response, to be handled appropriately in the browser.
- responseTime: the time (ms) it took between QEWD receiving the incoming WebSocket message from the
browser until it had the response ready to be forwarded to the browser. The very first time a particular
message is handled in a QEWD Worker process, QEWD has to find and load the handler module (and
potentially other supporting modules).  Depending on traffic at the time, QEWD may also need to
start a new Worker Process to handle the message.  All this takes time, so don't be surprised to
see a somewhat lengthy responseTime value first time.  Next time the same message is handled, 
all those resources will now be cached, and the response time will typically be a small number of
milliseconds.  You'll discover that QEWD is incredibly fast.


### Writing a QEWD Message Handler

Let's now fix that error by writing a handler for our *hello* message.

If you look in the *~/qewd-baseline* folder, you'll find a sub-directory named *qewd-apps*.  This sub-directory
is where you define handler modules for your interactive applications.  You can run as many applications
concurrently as you like in a QEWD system, and the *qewd-apps* sub-directory will contain a folder for
each of your applications: the folder name must be the same as the QEWD Application name.

If you look in the *qewd-apps* sub-folder, you'll see that an application folder named *jsdb-viewer* already
exists in it: this is for the back-end of the *viewer* application that is included with QEWD-baseline.

We need to add a new application folder to ~/qewd-baseline/qewd-apps.  In our *app.js* file, we
registered it using this:

          EWD.start({
            application: 'helloworld',  <==== ******
            io: io
          });

So we need to create a folder path of *~/qewd-baseline/qewd-apps/helloworld* for this.

          cd ~/qewd-baseline/qewd-apps
          mkdir helloworld

#### The Message *type*

When you use the *EWD.send()* method to send a message from the browser, you always send a JSON object,
and the object **must** have at least one property which is named *type*.

The *type* property value can be any string, and it provides the identifier by which QEWD can find
its handler module.

In our simple example, we used this in *app.js* to send the message:

                EWD.send({
                  type: 'hello'
                });

You'll see later how you can include any other JSON content in your message object, but for now we're
simply sending a message that just has a *type* property and nothing else.  In our case the *type* value
is *hello*, so QEWD will look for its handler in the file path *~/qewd-baseline/qewd-apps/helloworld/hello*.

Create this directory:

          cd ~/qewd-baseline/qewd-apps/helloworld
          mkdir hello
          cd hello

and then create a file named *index.js* (ie *~/qewd-baseline/qewd-apps/helloworld/hello/index.js*)
containing the following:

        module.exports = function(messageObj, session, send, finished) {
          finished({hello: 'world'});
        };

Save this file.

**NOTE**: when you first create a new application folder within the *qewd-apps* folder, you must restart
the QEWD Container, because this folder is read by QEWD's Master Process only when it starts up.

So, stop and restart the QEWD Container:

        cd ~/qewd-baseline
        ./stop

Then when the container has stopped:

        ./start

Note: a QEWD restart is **only** necessary when you create a brand new *qewd-apps* application folder.


Now reload the *hello world* page in your browser and click the *Send a message* button.

This time, in the browser's JavaScript console, you should see:

        received: {"type":"hello","finished":true,"message":{"hello":"world"},"responseTime":"28ms"}

So as before when we saw the error response, the structure is the same:

        {
            "type": "hello",
            "finished": true,
            "message": {
                "hello": "world"
            },
            "responseTime": "28ms"
        }

But this time, the response we defined in the handler module:

          finished({hello: 'world'});

is received by the browser in the *message* property of the response:

            "message": {
                "hello": "world"
            },


You can also look in the QEWD Console Log and see it handling the message and the response, eg:


        Mon, 09 Dec 2019 14:47:26 GMT; worker 58 received message: {
        "type":"hello","token":"ea8db79a-db04-4931-8310-7355642bba47"}
        
        Mon, 09 Dec 2019 14:47:26 GMT; master process received response 
       from worker 58: {"type":"hello","finished":true,"message":{
       "hello":"world","ewd_application":"helloworld"}}


Let's take a look at the handler module again:

        module.exports = function(messageObj, session, send, finished) {
          finished({hello: 'world'});
        };

if you've previously taken the tutorial on [QEWD REST APIs](./REST.md), this should
look very similar.  However, the signature of the module interface is a little different.

A QEWD interactive application message handler module should export a function with 4 arguments:

- **messageObj**: an object containing the incoming message object that was sent by the browser.  This
will be identical to the object you specified in the browser's *EWD.send()* method, but will also include
a *token* property containing the QEWD Session token.

- **session**: an object representing the QEWD Session that was identified via the incoming *token*.  This
object's *data* property is a QEWD-JSdb Document Node object, and is available for state information
storage and management.

- **send**: a method provided by QEWD via which you can send *intermediate* WebSocket messages to the browser
that sent the original request

- **finished**: a method provided by QEWD via which you:

  - return a object as a response.  This object is specified as the one (and only) argument of the
*finished()* method;
  - signal to QEWD that you have finished using the QEWD Worker process, allowing it to be returned to
the available pool.

You can have zero or more *send()* method calls in your message handler modules, and the module's logic
**MUST** terminate with a *finished()* method call.


So, we have now successfully sent a WebSocker message from the browser, handled it in QEWD, and 
returned it to the browser.  

### Handling the Response in the Browser

We've seen the response object being received by the browser in its JavaScript console, but it's 
not being used in the browser's displayed markup.  Let's fix that now by editing *app.js*.

Change these lines:

              $('#messageBtn').on('click', function(e) {
                EWD.send({
                  type: 'hello'
                });
              });

To this:

              $('#messageBtn').on('click', function(e) {
                EWD.send({
                  type: 'hello'
                }, function(responseObj) {
                  $('#content').text('Hello ' + responseObj.message.hello);
                });
              });


Reload the browser, click the *Send a message* button, and this time you should see this appear
below the button:

        Hello world

The *EWD.send()* method's second argument is a callback function which provides you with the response
object as its argument.  You can then modify the browser page's Document Object Model (DOM) 
appropriately using the information returned in the response object.  In our case we're
dynamically creating a *Hello world* text content for the *\<div id="content"\>* tag.


That essentially covers the basics of WebSocket messaging and handling in interactive QEWD applications.
Whilst the example so far has been deliberately very basic, nevertheless you've been able to see
the entire *round-trip* life-cycle:

- an initiating event in the browser (a button click in our case)
- using *EWD.send* to send a message JSON payload, identified by a unique *type* property
- processing the message in QEWD using a handler module
- returning a response JSON payload from QEWD using the *finished()* method
- updating the browser's DOM with the response object, via the *EWD.send()* method's callback function.


An interactive QEWD application is simply an assembly of lots of such life-cycles.  The only difference
between our simple example and a real-world application will be:

- the complexity of the message and response object payloads;
- optionally, use of the QEWD Session to maintain state information for the user
- optionally, the use of additional, intermediate messages sent to the browser prior to
finishing the message handling
- the complexity of browser DOM manipulation on receipt of responses.


# Debugging Interactive QEWD Applications

For debugging the browser-side, front-end logic, the browser's development tools / JavaScript
console are usually adequate.

By turning on the QEWD Client logging, you'll also be able to see the outgoing messages and 
incoming responses in the browser's JavaScript Console.

Debugging your back-end QEWD message handler modules can be done in exactly the same way
as [documented for REST APIs](https://github.com/robtweed/qewd-baseline/blob/master/REST.md#debugging-qewd-api-handlers).

The only essentual differences are:

- Using the Node.js REPL for debugging:

  - REST APIs: 

        var x = require('./apis/hello_world')

  - Interactive application handlers:

        var x = require('./qewd-apps/helloworld/register')


- Using the Node-Inspector: Add the *debugger* line at the start of your handler module:

        module.exports = function(messageObj, session, send, finished) {
          debugger    <====***

  and then reload the *index.html* page in your browser and click the *Register* button.  First time
  you will see the *inspect* link appear, and once you bring up the Inspector panel, click the
  *Register* button again in the browser, and you should be positioned at the *debugger* line.



# A More Complex Interactive Application

Let's extend our simple *hello world* application into something more real-world.  We'll add an initial
login form, and then add a simple set of CRUD functionality to allow us to maintain the login
details.  Initially, we'll be a new user who needs to register.

As before, we'll illustrate this with a deliberately simple HTML and plain JavaScript/jQuery user
interface.  Feel free to later re-implement this demonstration application using the JavaScript
framework of your choice.

We'll be using the QEWD-JSdb database for maintaining the user authentication data.  It's actually
an ideal use for the Key/Object Store provided by the *KVS* model in QEWD-JSdb.

We'll also use the QEWD Session.

So let's get started.

## New User Registration

When a user first uses our application, they will need to register as a new user.  So let's begin by
adding that functionality.

### index.html

Edit the *index.html* file for our *hello world* application (*~/qewd-baseline/www/helloworld/index.html*)
and replace its contents with this:

        <!DOCTYPE html>
          <head>
            <title>QEWD WebSocket Application Demo</title> 
          </head> 
          <body>
            <script src="//ajax.googleapis.com/ajax/libs/jquery/2.2.0/jquery.min.js"></script>
            <script src="/socket.io/socket.io.js"></script>
            <script src="/ewd-client.js"></script>
            <script src="app.js"></script>
            <h3 id="header">
              QEWD WebSocket Application Demo
            </h3>
            <div id="register-form">
              Register to use this Demonstration
              <br><br>
              <table>
                <tr>
                  <td>What Username would you like to use?:</td>
                  <td>
                    <input type="text" id="new-username">
                  </td>
                </tr>
                <tr>
                  <td>Choose a Password:</td>
                  <td>
                    <input type="password" id="new-password">
                  </td>
                </tr>
                <tr>
                  <td>Confirm your Password:</td>
                  <td>
                    <input type="password" id="new-password-2">
                  </td>
                </tr>
                <tr>
                  <td colspan="2">
                    <button id="registerBtn">Register as a New User</button>
                  </td>
                </tr>
              </table>
            </div>
          </body>
        </html>


What we've changed is the contents of the page, and it will now show a new user registration form, 
in which the user must enter their username and password (plus confirmation of the password) 
before submitting it with a button click.

### app.js

Similarly, edit the *app.js* file (*~/qewd-baseline/www/helloworld/app.js*) and replace its 
contents with this:

        $(document).ready(function() {

          EWD.on('ewd-registered', function() {
            EWD.log = true;

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
                  alert('You have successfully logged in');
                }
              });
            });
          });

          EWD.start({
            application: 'helloworld',
            io: io
          });
        });


What we've done is to add an event handler for the new registration form's *registerBtn* button. 
This is only defined once the QEWD application is registered, ie:


          EWD.on('ewd-registered', function() {

            // QEWD and the browser are ready

            // Turn on the WebSocket message log in the browser
            EWD.log = true;

            //Create the register button click handler

            $('#registerBtn').on('click', function(e) {

              // handle the new registration button click

            });
          });

Note that we're enabling the console log so that we can see the outgoing and incoming WebSocket
messages during development.

The registration button click handler is fairly straightforward.  It applies some basic
validation to ensure the user entered actual values into the fields, and that the password and
its confirmation value match.  In this very basic demonstration, we're displaying any errors as
alerts.

If it passes the validation, then the username and two password values are sent to QEWD as a
WebSocket message with a *type* property of *register*:

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
                  alert('You have successfully logged in');
                }
              });

For now we'll use an alert to display any errors returned by QEWD, and also to confirm successful
registration/login.


### QEWD *register* Message Handler Module

Next, we need to create a handler module for this new *register* message.

Create this in the file path: *~/qewd-baseline/qewd-apps/helloworld/register/index.js* with the
following contents:

        module.exports = function(messageObj, session, send, finished) {
          if (session.authenticated) {
            return finished({error: 'Invalid action: You are already logged in!'});
          }
          var username = messageObj.username;
          if (!username || username === '') {
            return finished({error: 'Missing username'});
          }
          var password = messageObj.password;
          if (!password || password === '') {
            return finished({error: 'Missing password'});
          }
          var password2 = messageObj.password2;
          if (!password2 || password2 === '') {
            return finished({error: 'Missing password confirmation'});
          }
          if (password !== password2) {
            return finished({error: 'Passwords do not match'});
          }
          if (password.length < 6) {
            return finished({error: 'Password must be 6 or more characters'});
          }
        
          var authDoc = this.documentStore.use('userAuth');
          authDoc.enable_kvs();
          var arr = authDoc.kvs.getIndices();
          if (!authDoc.kvs.getIndices().includes('username')) {
            authDoc.kvs.addIndex('username');
          }
          if (authDoc.kvs.get_by_index('username', username)) {
            return finished({error: 'Username already in use'});
          }
          var id = authDoc.$('next_id').increment();
          authDoc.kvs.add(id, {
            username: username,
            password: password
          });

          session.authenticated = true;
          session.data.$('id').value = id;
          finished({ok: true});
        };

Let's go through this handler logic:

- it starts with a series of validations:

  - the user must not already be logged in when registering.  We can use the *session.authenticated*
flag for this.  This is set to *false* automatically when a new Session is created during application
registration (ie when you load/reload the web page).

  - there must be non-empty username, password and confirmation password, and the two passwords must
match.  We've also added a check to prevent too short a password.

- once the validations are complete, we're ready to make use of the QEWD-JSdb KVS database.  We're
going to use a QEWD-JSdb KVS document that we'll name *userAuth*:


          var authDoc = this.documentStore.use('userAuth');
          authDoc.enable_kvs();

In case this is the very first time our application is used, and hence the first time our
QWEWD-JSdb KVS document is used, we'll check and ensure that it's set up with an index defined for the
*username* property:

          var arr = authDoc.kvs.getIndices();
          if (!authDoc.kvs.getIndices().includes('username')) {
            authDoc.kvs.addIndex('username');
          }

With that index in place, we can use it to ensure that registered usernames are unique within the
KVS database, returning an error if we find a duplicate:

          if (authDoc.kvs.get_by_index('username', username)) {
            return finished({error: 'Username already in use'});
          }

Otherwise, we'll generate a new Id for the new registered user - we'll use a simple incrementing
value in the QEWD-JSdb document:

          var id = authDoc.$('next_id').increment();

Then we'll use that id as the key for our KVS record, and save the username and password in an
object against that key:

          authDoc.kvs.add(id, {
            username: username,
            password: password
          });

Note that the username will be automatically indexed when we do this.

We'll now flag the user within the QEWD Session as being logged in

          session.authenticated = true;

and we'll save the user's KVS key/id in the Session also:

          session.data.$('id').value = id;

and finally return a success object and tell QEWD that we're finished:

          finished({ok: true});


### Restart the QEWD Worker Processes

There's one important step left before we can try this out.  It will be familiar to you if you've
taken the REST tutorial: we need to stop the QEWD Worker Processes using the QEWD-Monitor application
to ensure that our new handler module is loaded into the Worker process that processes the incoming
message.  If you don't know how to do this, follow these instructions:

- Start it up in a new browser window using the URL (replacing the xx's appropriately for your system):

        http://xx.xx.xx.xx:8080/qewd-monitor

- You'll need to use the management password that you specified during the installation Q&A.  By default
it's:

        keepThisSecret!

- Once you've logged in, you'll be looking at the QEWD Monitor Overview panel.  On the right hand side you'll
see one or more Child Processes listed, each with a red X button beside it.  Click this button for each
currently-running process, so you shut them all down.  Note that in order to keep QEWD-Monitor working,
at least one new Worker process will be automatically restarted.  So just stop the ones that were originally
running and ignore any new ones that restart!


### Try out the New Registration Form

We're now ready to try our revised application.

Reload the *index.html* file in your browser:

        http://xx.xx.xx.xx:8080/helloworld

You should now see the new user registration form.  You can try testing the validation logic if you like, 
to confirm it's all working correctly.  Then you can try a valid new registration, eg:

- username: *rtweed*
- password: *secret*

You should get a confirmation alert telling you that the registration was successful.


### Inspect the QEWD-JSdb KVS Data

You can do this using the *QEWD-Monitor* application (see the earlier instructions on debugging).

Click the *Document Store* tab/link in the banner at the top of the page.

If you don't already see *^userAuth* appear in the *Documents* list, click the green *Refresh* button
at the right-hand end of the *Documents* panel banner.

You can now drill down through the structure of the *^userAuth* document to see what was created 
when you registered as a user of our application.


## Add A Login Form

Now that we've created our user authentication record, we need to add a Login form to our
*index.html* file.  In fact, when you load the page, the login form should be the only form we see, but
we should also have a *Register* link that, when clicked, replaces the Login form with our
Register New User form.

### index.html

Let's modify the *index.html* and add the Login form.

After these lines:

            <h3 id="header">
              QEWD WebSocket Application Demo
            </h3>

Add this:

            <div id="login-form">
              You must first Log in
              <br><br>
              <table>
                <tr>
                  <td>Username:</td>
                  <td>
                    <input type="text" id="username">
                  </td>
                </tr>
                <tr>
                  <td>Password:</td>
                  <td>
                    <input type="password" id="password">
                  </td>
                </tr>
                <tr>
                  <td colspan="2">
                    <button id="loginBtn">Login</button>
                  </td>
                </tr>
              </table>
              <br>
              <a href="#" id="registerLink">Register</a>
            </div>

Note the *Register* link at the bottom of this form.

Let's also add a link to the Register form to make it possible to get back to the
Login form from the Register form.

Find these lines in the Register form that we created earlier:

                <tr>
                  <td colspan="2">
                    <button id="registerBtn">Register as a New User</button>
                  </td>
                </tr>
              </table>

and change them to this:


                <tr>
                  <td colspan="2">
                    <button id="registerBtn">Register as a New User</button>
                  </td>
                </tr>
              </table>
              <br>
              <a href="#" id="loginLink">Return to Login Form</a>
            </div>

### app.js

We need to add some dynamic control now:

- hiding both the forms to begin with
- display the Login form when QEWD is ready
- when the Register link is clicked, hide the Login form and display the Register form
- if the Register form is visible and the *Return to Login Form* button is pressed, hide the
Register form and display the Login Form.

#### Initially hide both forms:

Immediately after this line:

        $(document).ready(function() {

Add these lines:

          $('#login-form').hide();
          $('#register-form').hide();


#### Display the Login Form when QEWD is Ready

At the bottom of the *app.js* file, replace these lines:

            });
          });

          EWD.start({
            application: 'helloworld',
            io: io
          });
        });

with these:

            });

            $('#login-form').show();
          });

          EWD.start({
            application: 'helloworld',
            io: io
          });
        });


#### when the Register link is Clicked


Immediately after these lines


          EWD.on('ewd-registered', function() {
            EWD.log = true;


Add these lines:


            $('#registerLink').on('click', function(e) {
              $('#login-form').hide();
              $('#register-form').show();
            });


#### When the *Return to Login Form* Button is Clicked

After the lines you just added (ie the *registerLink* Click handler), add the following lines:

            $('#loginLink').on('click', function(e) {
              $('#login-form').show();
              $('#register-form').hide();
            });


### Try out our Front-end Changes

Save your edited versions of *index.html* and *app.js* and try them out by reloading the page
in your browser.

You should now see the Login form, with the *Register* link below it.  Try clicking it and
you should now see the Register form, with the *Return to Login Form* link.  Click it and
the Login form should re-appear.

So the front-end is now behaving itself.  Now we need to bring the Login form to life.


#### Submitting the Login Form

SO now we need to add a Click event handler to *app.js* for the *Login* button in our
newly-added Login form.  It needs to perform basic validation to ensure that the username
and password are filled out with values, and, if so, send them as a *login* WebSocket message
payload to the QEWD backend.


Find these lines at the bottom of the *app.js* file:

            $('#login-form').show();
          });

          EWD.start({
            application: 'helloworld',
            io: io
          });
        });

and, immediately **before** them, add the following:


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
                  $('#login-form').hide();
                  $('#register-form').hide();
                  alert('You have successfully logged in');
                }
              });
            });


Hopefully this pattern of logic is beginning to become self-explanatory.  The key thing is
we're using *EWD.send()* to send a WebSocket message object payload, with a *type* property of
*login*, and we've added to the payload the username and password that the user has entered
into the form.

### QEWD *login* Handler Module

That's the front-end all ready.  We now just need to add the back-end QEWD message handler
module for this new *login* message.

You need to create a file named *index.js* with the full file path:

        ~/qewd-baseline/qewd-apps/helloworld/login/index.js

Add the following contents to it:


        var isEmpty = require('../../../utils/isEmpty');
        
        module.exports = function(messageObj, session, send, finished) {
          if (session.authenticated) {
            return finished({error: 'Invalid action: You are already logged in!'});
          }
          var username = messageObj.username;
          if (!username || username === '') {
            return finished({error: 'Missing username'});
          }
          var password = messageObj.password;
          if (!password || password === '') {
            return finished({error: 'Missing password'});
          }
          var authDoc = this.documentStore.use('userAuth');
          authDoc.enable_kvs();
          var matches = authDoc.kvs.get_by_index('username', username, true);
          if (isEmpty(matches)) {
            return finished({error: 'Invalid login attempt (0)'});
          }
          for (var id in matches) {
            var authDetails = matches[id];
            break;
          }
          if (authDetails.password !== password) {
            return finished({error: 'Invalid login attempt (1)'});
          }
        
          session.data.$('id').value = id;
          session.authenticated = true;
          finished({ok: true});
        };


As before, let's step through this logic and explain what it's doing.

If you've previously taken the REST API tutorial, you'll be familiar with our use of the
handy *isEmpty* utility.  We'll load that into the module for later use, as you'll see:

        var isEmpty = require('../../../utils/isEmpty');


We first check that the user is not already logged in - the login handler should only
be invoked for users who **aren't** yet logged in.  The *session.authenticated* flag
allows us to check the status of the user:


          if (session.authenticated) {
            return finished({error: 'Invalid action: You are already logged in!'});
          }

We then check the username and password properties of the received message payload, to
ensure that they have non-empty values.

Then we're ready to check the user credentials against those stored in the QEWD-JSdb KVS store.

We first set up access to it:

          var authDoc = this.documentStore.use('userAuth');
          authDoc.enable_kvs();

We can then use its *username* index to see whether the specified username exists in the
KVS:

          var matches = authDoc.kvs.get_by_index('username', username, true);

This will return an empty object if no match is found, in which case we'll return an error:

          if (isEmpty(matches)) {
            return finished({error: 'Invalid login attempt (0)'});
          }

There's our *isEmpty* module in use!


If a match was found, what will have been returned from the KVS API an object containing
the keys and data for any matches.  If you remember, the *register* handler logic prevents
duplicate user names, so the object returned should just contain a single key/object pair.  So
we'll do this to extract the first (and only) one:

          for (var id in matches) {
            var authDetails = matches[id];
            break;
          }

*authDetails* will be an object, fetched from the KVS, that contains the *username* and *password*
properties of the matching user.  So we now want to check that the user entered the correct password:

          if (authDetails.password !== password) {
            return finished({error: 'Invalid login attempt (1)'});
          }

Note that for now I've added a diagnostic (0) and (1) to the *Invalid login attempt* messages: this
will allow us to check that each one works (0 = invalid username; 1 = invalid password).  In production
this distinction should be removed to avoid giving clues as to why a login attempt failed.

So if we've reached this point, the user has correctly authenticated.  So we'll set the
*authenticated* flag in the user's Session:

          session.authenticated = true;

and we also record the QEWD-JSdb KVS key in the user's session.  You'll see later why we do this:

          session.data.$('id').value = id;

and finally we return a success response object and tell QEWD that we're finished with the
Worker Process:

          finished({ok: true});

### Try Logging in

We can now try logging in using this new logic.  However, we first need to use
QEWD-Monitor to stop the Worker processes.  Then reload the browser and enter the username
and password you used when you registered earlier, eg I used

- username: *rtweed*
- password: *secret*

You should get an alert saying you logged in.

Try reloading the browser and try deliberately bad values - check that you get the appropriate errors
if you try a non-existent username, or the wrong password for your registered user.

### Check the User's Session

One more thing to try: reload the browser and login using the correct username and password.

Now in a separate browser window running the QEWD-Monitor application, click on the *Sessions* link/tab
in its top banner.

If necessary, click the green *refresh* button at the far right-hand end of the *Sessions* panel banner.

Click the blue *Inspect* button next to the last *helloworld* session in the list.  In the right-hand
panel, you should see something like:

        ewd-session: -->
        id: 1

The *id* is the value we stored for the KVS key.

Click on the *ewd-session* line and it should expand, showing the *authenticated* flag set to *true*.


So we can now register new users and login using the registered username and password.


### Maintain User Data

When you either register a new user or login as an existing user, the browser page allows no
further interaction after alerting you that you've logged in.

Let's change that and, once logged in (either after *register* or *login*), display:

- a form that allows you to change your username
- a form that allows you to change your password
- a link that allows you to de-register as a user of the application
- a link that allows you to logout

Rather than provide within this tutorial all the source code, and rather than then walking
 you through all the logic for the final version of our application,
you'll find a complete set of source code for it in the path:

        ~/qewd-baseline/examples/demo

I'll leave it as an exercise for you to examine the source code and figure out how and why
it works.  You'll find that it's all just variations on the themes we've already seen and examined
in detail, so it should mostly be self-explanatory by now.

You'll find the final versions of the front-end *index.html* and *app.js* files in:

        ~/qewd-baseline/examples/demo/www

Copy these to overwrite your versions in:

        ~/qewd-baseline/www/helloworld


You'll find the final full set of back-end handler modules in:

        ~/qewd-baseline/examples/demo/qewd-apps

Copy these to:

        ~/qewd-baseline/qewd-apps/helloworld

overwriting any of your existing versions, and adding the new ones.

Stop all the QEWD Worker processes using the QEWD-Monitor application and then reload the updated
*helloworld* application's *index.html* page in your browser.  You can now try out the full functionality.

While you are trying out the application:

- check the activity in the browser's JavaScript console, and see the outgoing messages and incoming 
responses

- check and drill down through the *^userAuth* QEWD-JSdb KVS document using the QEWD-Monitor's 
*Document Store* tab to see the effect of changes you make to the username and/or passwords

- check the QEWD Sessions using the QEWD-Monitor's *Sessions* tab

- check the QEWD Container's console log to see the activity within it as you run the application


You're now ready to begin creating your own Interactive QEWD Applications.  All the techniques you've
seen in action within this tutorial are the building blocks of every QEWD application you'll build.


# Using Intermediate Messages

WebSockets provide a persistent, bi-drectional network connection between the browser and QEWD
back-end.  Unlike HTTP, WebSocket messages are one-directional and can be instigated by either end.

The standard use of WebSocket messages in QEWD, as described thus far in this tutorial, emulate
HTTP messages where the browser initiates the process, sends a message and gets a response back.

However, one of the interesting possibilities you have within your back-end message handler
modules is to return multiple messages to the browser during the processing of the message.  The
so-called *intermediate* messages that preceed the final *finished()* message can be sent to the
browser using the *send()* method that is provided by the message handler module interface.

[Click here](https://github.com/robtweed/qewd/blob/master/up/docs/InteractiveApps.md#intermediate-messages)
 for full details on using intermediate messages.


# Using 3rd Party Node.js Modules in your Handler Modules

One of the amazingly powerful things about using Node.js is the massive ecosystem of
 3rd-party modules that are available on NPM.

QEWD allows you to use any 3rd-party Node.js Modules you want or need to assist in your
back-end message handler module logic.

However, in order to use 3rd-party modules in the Dockerised version of QEWD, you must tell 
it to install them when it first starts up.

## Installing 3rd-Party Modules

You instruct QEWD to install 3rd party modules in the same way 
[as described for REST APIs](https://github.com/robtweed/qewd-baseline/blob/master/REST.md#installing-3rd-party-modules).


## Using 3rd Party Modules

Again, the approach is identical to that 
[described for REST APIs](https://github.com/robtweed/qewd-baseline/blob/master/REST.md#using-3rd-party-modules)


# Accessing External Resources from your Message Handler Modules

Although you perform your message handler logic within a back-end QEWD handler module, 
you may want/need to access external resources, eg REST services.

QEWD is quite happy to let you to this. For example, you could use the request module to make 
REST requests to an external REST service. Let's use a well-known test service as a demonstration:


    var request = require('request');
    var count = 0;
    
    module.exports = function(messageObj, session, send, finished) {
      count++;
      var options = {
        uri: 'https://jsonplaceholder.typicode.com/todos/' + count,
        method: 'GET'
      };
      request(options, function(error, response, body) {
        finished(JSON.parse(body));
      });
    };


Each time this message handler was invoked, you would get the next generated record from the 
*jsonplaceholder* REST service.

Note that because we're using an asyncronous piece of logic, the *finished()* function **MUST** 
be called inside the *request()* function's callback, so the QEWD Worker process isn't released 
back to its available pool until the REST response from *jsonplaceholder* has been received.


# Advanced Interactive QEWD APplications

[Click here](https://github.com/robtweed/qewd/blob/master/up/docs/InteractiveApps.md)
for further details and documentation on Interactive QEWD Applications, including the
so-called *Life-Cycle Event Hooks*.




# Hints on using the QEWD Client in JavaScript Frameworks

If you want to build QEWD applications with a browser front end (or even a Native Mobile
JavaScript-based front end), then you need to load the QEWD Client and make use of its
APIs for application registration and message sending/receipt.

There are two available pre-built modules that can be used in React applications:

- [qewd-react](https://github.com/robtweed/qewd-react)
- [react-qewd](https://github.com/wdbacker/react-qewd)

If you want to use Vue.js and Nuxt.js:

- [vue-qewd](https://github.com/wdbacker/vue-qewd)


If you want to use QEWD with another JavaScript framework, the key things you need
to be aware of are:

- the QEWD Client (known as *ewd-client*) can be loaded as a module, eg:

  - install it using:

        npm install ewd-client

  - load it using:

        var qewd_client = require('ewd-client')

- you need to prevent the JavaScript framework from allowing any user interaction until the
*ewd-client*'s *start()* method has been invoked, and the *ewd-registered* event has been
triggered

- you need to pass *ewd-client*'s *EWD* object to all components/modules that need to
send messages to and/or receive responses from the QEWD back-end.  This is **not** a globally-scoped
object, and, for example, the QEWD session token and, indeed, *socket.io* are secured within a
closure that is created by the *start()* method.  You cannot, therefore, access its methods and
events without explicitly passing the *ewd-client*'s *EWD* object to components and modules.

Take a look at the pre-built examples referred to above to see how these issues have been handled
for React and Vue.

