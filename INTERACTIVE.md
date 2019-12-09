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


Starting the QEWD Client triggers a chain of events.  In summary:

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


and we dynamically generated the text inside the *index.html* file's *<div id="content">* tag:

              $('#content').text('Hello World is ready for use!');

which is what we then saw in the browser.

Finally we also added this:

              EWD.log = true;

This will allow us to see the communication that takes place between the browser and the QEWD back-end
when we begin to send messages and receive responses.


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
after the *ewd-registered* event has occurred.  Edit the *div id="content">* tag in the
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
button.  Try clicking it and you'll see an alert.  Note how we didn't set up the butto event
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
- message: sub-object containing the response message payload.  It *message.error* is defined, then this
is an error response, to be handled appropriately in the browser.
- responseTime: the time (ms) it took between QEWD receiving the incoming WebSocket message from the
browser until it had the response ready to be forwarded to the browser.


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

Now, when you first create a new application folder within the *qewd-apps* folder, you must restart
the QEWD Container, because this folder is read by QEWD's Master Process only when it starts up.

So, stop and restart the QEWD Container:

        cd ~/qewd-baseline
        ./stop

Then when the container has stopped:

        ./start

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

if you've previously taken the tutorial on QEWD REST APIs (./REST.md), this should
look very similar.  However, the signature of the module interface is a little different.

A QEWD interactive application message handler module should export a function with 4 arguments:

- messageObj: an object containing the incoming message object that was sent by the browser.  This
will be identical to the object you specified in the browser's *EWD.send()* method, but will also include
a *token* property containing the QEWD Session token.

- session: an object representing the QEWD Session that was identified via the incoming *token*.  This
object's *data* property is a QEWD-JSdb Document Node object, and is available for state information
storage and management.

- send: a method provided by QEWD via which you can send *intermediate* WebSocket messages to the browser
that sent the original request

- finished: a method provided by QEWD via which you:

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
dynamically creating a *Hello world* text content for the *<div id="content">* tag.


That essentially covers the basics of WebSocket messaging and handling in interactive QEWD applications.
Whilst the example so far has been deliberately very basic, nevertheless you've been able to see
the entire *round-trip* life-cycle:

- initiating event in the browser (a button click in our case)
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


# A More Complex Example to Illustrate these Features

... to follow





