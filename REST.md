# qewd-baseline: Developing REST APIs with QEWD
 
Rob Tweed <rtweed@mgateway.com>
4 December 2019, M/Gateway Developments Ltd [http://www.mgateway.com](http://www.mgateway.com)  

Twitter: @rtweed

Google Group for discussions, support, advice etc: [http://groups.google.co.uk/group/enterprise-web-developer-community](http://groups.google.co.uk/group/enterprise-web-developer-community)


# About this Document

This document provides a tutorial on how to create REST APIs on your QEWD system


# Background

QEWD's [*QEWD-Up*](https://github.com/robtweed/qewd/tree/master/up) development pattern 
makes it very quick and simple to create REST APIs.

We'll use QEWD-Up techniques to create some example REST APIs.

We'll also introduce how to make use of [*QEWD-JSdb*](https://github.com/robtweed/qewd-jsdb) 
within your QEWD REST API back-end handling logic.


# Hello World

Let's start in time-honoured fashion with a simple "Hello World" API.

## API Routes

The first thing is to decide on a suitable API Route for this. Let's go for:

        GET /api/hello

The first thing you need to know about QEWD is that its REST API Routes **MUST** have at least 2 parts
to their path.  Strictly-speaking the first part (*api* in our example) defines a QEWD Application.
An application must have at least 1 member, defined by the 2nd part of the path,
 so */api* alone would fail to work. 

We could, of course, alternatively gone for:

        GET /hello/world

which would also satisfy the QEWD minimum REST API path rules.

What you choose for the path is entirely up to you - it has no inhererent meaning as far as QEWD
is concerned, and there is no effective maximum number of parts in a path, though you'll
typically want to use the minimum practical.

You can read the 
[full details on defining QEWD API Routes here](https://github.com/robtweed/qewd/blob/master/up/docs/Routes.md)


So, having decided on *GET /api/hello*, edit the file:


        ~/qewd-baseline/configuration/routes.json

You can use any text editor for this.

This file contains content in JSON format, defining an array of API Route objects.  Each
API Route object has these properties:

- uri: The API path
- method: The HTTP method for this API
- handler: The name of the module that will handle incoming requests for this API route

You'll see when you open the *routes.json* file in your editor that it already contains two
API Routes.  Please leave them alone - they are already configured and active in your QEWD
system:

- GET /jsdb/viewer/refresh:  used by the QEWD-JSDB viewer application, should you decide to use
 it during development / debugging
- POST /qewd/shutdown: used by the *./stop* command line script to cleanly and securely shut down
your QEWD system

So, add our new API route to the file, eg it should look something like this:

        [
          {
            "uri": "/api/hello",
            "method": "GET",
            "handler": "hello_world"
          },
          {
            "uri": "/jsdb/viewer/refresh",
            "method": "GET",
            "handler": "qewd_refresh_viewer"
          },
          {
            "uri": "/qewd/shutdown",
            "method": "POST",
            "handler": "qewd_shutdown"
          }
        ]

As you can see, we've decided that we'll handle this API Route using an as-yet-unwritten 
module called *hello\_world*.

Save the *routes.json* file.


## The API Handler Module

Now we need to create the *hello\_world* handler module.

In the folder *~/qewd-baseline/apis* you need to add a folder named *hello\_world*, eg:

        cd ~/qewd-baseline/apis
        mkdir hello_world

Use your editor to create a new file in this new folder named *index.js*, ie you'll be creating:

        ~/qewd-baseline/apis/hello_world/index.js

Add the following contents:


        module.exports = function(args, finished) {
          finished({hello: 'world'});
        };

Save the *index.js* file.


## Test the Hello World API

## Restart QEWD

Before we can run our API, we must stop and restart the QEWD Container.  This needs to be done
if either of the files in the *~/qewd-baseline/configuration* folder are changed, as these
are only read by QEWD when it starts up.  We changed the *routes.json* file, so we'll need
to restart QEWD in order for it to recognise the new API Route that we've just added.

Restarting QEWD is very quick and simple:

        cd ~/qewd-baseline
        ./stop

Then when the container has stopped:

        ./start


## Try the API

As we've defined a simple *GET* API, we can just use a browser for this.

In a browser, enter the URL:

        http://xx.xx.xx.xx:8080/api/hello

Change the xx's for the IP address or domain name of the host server on which you're running the QEWD
Container.

You should see the response:

        {hello: 'world'}

Bingo! You've just got your first QEWD REST API working!


## How Did that Handler Work?

On the basis of the information we provided about our API in the *routes.json* file, QEWD
expected to find a module in the */apis* folder named *hello\_world*.

It expects that the module it finds there will export a function with 2 arguments:

- **args**: an object that contains the content of the incoming REST request, 
including its path, headers, HTTP method, any querystring values and any body payload

- **finished**: a built-in QEWD function that you use to end your handler.  This function serves two
purposes:

  - it releases the QEWD worker process that handled your module back to QEWD's available worker pool
  - it tells QEWD to return the object you provide as its argument as a JSON response to the REST client
 that sent the original request.

In our simple example we didn't need any information about the incoming request, so we didn't
refer to the *args* property.

However, we did use the *finished()* function:

          finished({hello: 'world'});

And sure, enough, the response in the browser was *{hello: 'world'}*.


## Error Handling

QEWD will only respond to API Routes that are registered in the *routes.json* configuration file.
Try any other API route and you'll receive an error, eg try:

          
        http://xx.xx.xx.xx:8080/api/hellox

and you'll get the response:

        {error: "No handler defined for api messages of type hellox"}

The response object property *error* is reserved in QEWD, providing you with a very
easy and convenient way to return errors.  Let's try it out by editing our handler and making
it always return an error.

Edit the file:

        ~/qewd-baseline/apis/hello_world/index.js

and replace the *finished()* line with:

        finished({error: 'I forced this error'});

Save the file and try the URL in the browser again.


Now, the chances are that you didn't see the error, but saw *{hello: world}* again.
That's because, in QEWD, the handling of messages takes place in persistent Worker Processes.

Becaue they are persistent, once they load a module, they cache it.  So even though we've changed
the *hello\_world* handler module, it won't have been reloaded into any of the running QEWD Worker
Processes.

Now one "sledge hammer" way to fix that would be to restart QEWD again, but actually there's a simpler and
slicker way than that.  It involves the use of an application that is always automatically available
in QEWD: the *qewd-monitor* application.

Start it up in your browser using the URL:

        http://xx.xx.xx.xx:8080/qewd-monitor

You'll need to use the management password that you specified during the installation Q&A.  By default
it's:

        keepThisSecret!

Once you've logged in, you'll be looking at the QEWD Monitor Overview panel.  On the right hand side you'll
see one or more Child Processes listed, each with a red X button beside it.  Click this button for each
currently-running process, so you shut them all down.  Note that in order to keep QEWD-Monitor working,
at least one new Worker process will be automatically restarted.  So just stop the ones that were originally
running and ignore any new ones that restart!

Now try the */api/hello* API

This time you should see the error!

        {error: "I forced this error"}

You should also notice that the HTTP response code for this error response was *400 Bad Request*

That happens automatically if you send an *error* object through the *finished()* function in
your handler.

You can actually control the status.  Try editing the *hello\_world/index.js* file again and
change the *finished* line to:

        finished({
          error: 'I forced this error',
          status: {
            code: 402
          }
        });

Remember to restart the QEWD Worker processes using the QEWD-Monitor application, then try the
*/api/hello* URL again.  This time you should see its HTTP response status has changed to:

        402 Payment Required


## Using the *args* Handler Module Argument

The easiest way to understand the contents of the *args* argument is to see its contents with
various incoming requests.

Change the *finished()* line in the *hello\_world/index.js* module file to:

        finished(args);

Stop the QEWD Worker processes using the QEWD-Monitor application, then try the URL again in your browser.

Now you'll see the contents of the *args* object in your browser.  The most important parts are:

- req: The incoming HTTP request information, including:
  - path: the incoming API path
  - method: the HTTP method that was used
  - headers: the incoming HTTP request headers
  - query: any query string parameters in the incoming request
  - body: any POSTed body payload

Try adding some query string parameters to the URL, eg:

        http://178.128.172.121:8080/api/hello?a=b&b=x

and you'll see the following now in the *args* object:

        query: {
          a: "b",
          b: "x"
        }

So let's make use of that in our handler.  Try changing it to the following:

        module.exports = function(args, finished) {
          if (args.req.query.word) {
            finished({word: args.req.query.word});
          }
          else {
            finished({error: 'You must add ?word={value} to the URL'});
          }
        };

Remember to stop the Worker Processes and try the URL in the browser again.  

You should now find that only if you
add something like *?word=hello* to the URL will you get a non-error response.


## Debugging QEWD API Handlers

You may have made some errors whilst entering and editing your *hello\_world/index.js* file.
If so, depending on the mistake you made, you'll have seen some kind of error appearing
in the browser's response, but it's likely that it didn't give you much clue as to what
you'd done wrong.

So this is probably a good time to look at some of the ways in which you can
debug a QEWD application.

### Check your handler's syntax using JSHint

Most of the time, the problem will be a simple JavaScript syntax error in your module.  The editor
you use may help you to spot and/or avoid these, but if you're using a simpler text error, it's
not so easy.

Something I'll often use to check and locate syntax errors is the online 
[JSHint](https://jshint.com/) tool.  Just copy and paste the contents of your handler module
into it, and it will usually find any bugs pretty quickly!


### Check your handler using the Node REPL

Another option is to use the Node.js REPL and try *require()*'ing your module:

- Shell into the QEWD Container:

        docker exec -it qewd bash

- When your in the Container's *bash* shell, switch to the */opt/qewd/mapped* folder:

        cd mapped

Now start the Node.js REPL:

        node

You should see something like:

        Welcome to Node.js v12.13.0.
        Type ".help" for more information.
        > 

Type:

        var x = require('./apis/hello_world')

If the module contains any syntax errors, you'll see an error with some diagnostic information, eg:

        Thrown:
        /opt/qewd/mapped/apis/hello_world/index.js:5
          else {
          ^^^^
        
        SyntaxError: Unexpected token 'else'
        >


Once it's error-free, you'll see it load silently:

        > var x = require('./apis/hello_world')
        undefined
        >

For good measure, try typing:

        x

and you should see:

        [Function]


To exit the Node.js REPL, type CTRL&C twice.


### Using the QEWD Console Log

The QEWD process logs all sorts of diagnostic and trace information as it runs, and, as you become
familiar with the operation of QEWD, it can be a useful place to track down and pinpoint what's
gone wrong with your logic.

In a separate process window, simply type:

        docker logs -f qewd

Use the QEWD-Monitor application to stop the Worker Processes, and then try running 
your API in the browser again.

If there's a syntax error, you may see an error reported when QEWD attempts to
load it, eg:

        running up/handlers.js in process 253
        handlerRootPath = /opt/qewd/mapped/apis
        ** Warning - unable to load handler from /opt/qewd/mapped/apis/hello_world:
        /opt/qewd/mapped/apis/hello_world/index.js:2
          xif (args.req.query.word) {
                            ^
        
        SyntaxError: Unexpected token '{'
            at Module._compile (internal/modules/cjs/loader.js:892:18)
            at Object.Module._extensions..js (internal/modules/cjs/loader.js:973:10)
            at Module.load (internal/modules/cjs/loader.js:812:32)
            at Function.Module._load (internal/modules/cjs/loader.js:724:14)
            at Module.require (internal/modules/cjs/loader.js:849:19)
            at require (internal/modules/cjs/helpers.js:74:18)
            at /opt/qewd/node_modules/qewd/up/handlers.js:94:21
            at Array.forEach (<anonymous>)
            at getRoutes (/opt/qewd/node_modules/qewd/up/handlers.js:66:15)
            at workerProcess.init (/opt/qewd/node_modules/qewd/up/handlers.js:211:18)


When/if your module is working correctly, you'll see something like this:

        Wed, 04 Dec 2019 17:38:30 GMT; worker 178 received message: 
        {"type":"ewd-qoper8-express","path":"/api/hello?word=hello",
        "method":"GET","headers":{"host":"178.128.172.121:8080",
        "connection":"keep-alive","cache-control":"max-age=0",
        "upgrade-insecure-requests":"1","user-agent":"Mozilla/5.0 
        (Macintosh; Intel Mac OS X 10_14_3) AppleWebKit/537.36 
        (KHTML, like Gecko) Chrome/77.0.3865.120 Safari/537.36",
        "accept":"text/html,application/xhtml+xml,application/xml;
        q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3",
        "accept-encoding":"gzip, deflate","accept-language":
        "en-GB,en-US;q=0.9,en;q=0.8","if-none-match":"W/\"10-A/pKR9MRq
        7jEJixTkTsZ7ZIRpe0\""},
       "params":{"type":"hello"},"query":{"word":"hello"},"body":{},
       "ip":"::ffff:81.143.223.229","ips":[],"application":"api",
       "expressType":"hello"}

       Wed, 04 Dec 2019 17:38:30 GMT; master process received response 
       from worker 178: {"type":"ewd-qoper8-express","finished":true,
       "message":{"word":"hello","restMessage":true,"ewd_application":"api"}}

That first log message is the incoming request being picked up by the QEWD
Worker Process

The second message is the QEWD Master Process logging receipt of the message
from the Worker Process - usually as a result of the worker's invocation of the
*finished()* function.

You can see that there's quite a lot of diagnostic information that can be gleaned
from this log.


### Using Chrome's Inspector

If you want to do full-blown debugging of your handler methods, then you
can make use of Chrome's Inspector.

To do so, you'll need to make use of the special *docker_debug* mode that is
supported by the Dockerised version of QEWD.  Here's the steps to getting going:

- stop the QEWD Container using the *stop* script:

        cd ~/qewd-baseline
        ./stop

- edit the *config.json* file (ie *~/qewd-baseline/configuration/config.json*) and
amend/add the lines shown below:

        {
          "qewd_up": true,
          "qewd": {
            "bodyParser": "body-parser",
            "port": "8080",
            "poolSize": "1",                         <===== ****
            "mode": "docker_debug",                  <===== ****
            "managementPassword": "keepThisSecret!"
          }
        }

ie:

- set the poolSize to 1, to ensure that all handler processing will occur in just one QEWD Worker process
- set the mode the *docker_debug*, which instructs *ewd-qoper8* to start the Worker Process using
the *--inspect-brk=0.0.0.0* parameter set.


- Next, edit your handler method (eg in our case: *~/qewd-baseline/apis/hello\_world.index.js*),
and add *debugger* as its first line inside the module, eg:

        module.exports = function(args, finished) {
          debugger                                  <====***
          if (args.req.query.word) {
            finished({word: args.req.query.word});
          }
          else {
            finished({error: 'You must add ?word={value} to the URL'});
          }
        };

- Open a new Chrome window and enter the URL:

        chrome://inspect

  Under *Devices*, click the *Configure* button next to *Discover network targets*

  In the *Target discovery settings* pop-up, add a new target as follows:

        xx.xx.xx.xx:9229

  replacing xx.xx.xx.xx with the IP address or domain name of the host server that is
running the QEWD Container, eg:

       192.168.1.199:9229

  Then click the *Done* button to close the pop-up

  You should now see a heading *Remote Target* against the IP address you entered.


- Now restart the QEWD Container in debug/shell mode:

        cd ~/qewd-baseline
        ,/start_debug

  The Container will start up, but you'll be placed directly into its *bash* shell, and QEWD
will not be running.

  You can now manually start QEWD by typing:

        node qewd

  You'll see the QEWD log report appearing and it should sit and wait after displaying:

        ========================================================
        ewd-qoper8 is up and running.  Max worker pool size: 1
        ========================================================
        ========================================================
        QEWD.js is listening on port 8080
        ========================================================


- Now go to your browser or REST client and try your REST API, eg:

        http://192.168.199/api/hello?word=testing

- If you now look in the Chrome Inspector window, you should see under that
*Remote Target* heading:

        node_modules/ewd-qoper8-worker.js file:///opt/qewd/node_modules/ewd-qoper8-worker.js
        inspect

  Click on the *inspect* link and up should pop the Node Inspector debugger panel

- Now try your API again in the browser/REST Client:

        http://192.168.199/api/hello?word=testing

  and this time the Node Inspector window should be showing that its stopped at the *debugger* line
you inserted into your module.

  Now you can use the Node Inspector debugger to single-step through your code, view the stack and
resources etc.


- When you have debugged your module, you'll want to exit debug mode.  Just type *CTRL&C* in the
terminal window where the QEWD log is showing.

  QEWD will shut down and you'll be returned to the shell prompt, eg:

        root@1f37902b1a00:/opt/qewd#

  If you look in Chrome, you should see that the *Remote Target* *inspect* link has now
disappeared.

  Stop the QEWD Container and exit it by typing:

        exit

- re-edit the *config.json* file (ie *~/qewd-baseline/configuration/config.json*) and
set it back to normal mode by removing the *mode* property and re-setting the *poolSize*:

        {
          "qewd_up": true,
          "qewd": {
            "bodyParser": "body-parser",
            "port": "8080",
            "poolSize": "3",        <===== reset to use however many Workers you need
            "managementPassword": "keepThisSecret!"
          }
        }

- You can now restart the QEWD Container in normal mode:

        ./start


# Extending the Hello World API

Our API doesn't exactly do a great deal, but we have already seen how it can allow you
to use Query String name/value pairs and cater for them in your logic.

Let's take a look at some other ways of conveying additional information into
your API's back-end handler.

## POST Body Payloads

We've seen a GET REST API, now let's create a POST one.

- The first thing we need to do is to add a new API Route to the *routes.json* file 
(*~/qewd-baseline/configuration/routes.json*)

  Add the following new route to the existing array:

          {
            "uri": "/api/hello",
            "method": "POST",
            "handler": "hello_world_post"
          },

  We'll use the same API URI path, but just change the HTTP request method.  We're also going
to use a new handler method, specifically for this API Route: *hello\_world\_post*.

  Save the edited *routes.json* file and restart the QEWD Container, to make sure this change
is picked up by QEWD's master process.

- Next, we need to create the handler module file, which will have the file path:

        ~/qewd-baseline/apis/hello_world_post/index.js

So, create the *hello\_world\_post* folder under the */apis* folder, and then create the *index.js* file,
and, to begin with we'll use this logic:

        module.exports = function(args, finished) {
          finished(args);
        };

In other words, it will just echo back the contents and structure of the *args* argument to our
browser.

Save the *index.js* file and now try out the API.  Because this requires a POST request, you'll now need to use
a REST Client rather than a browser, eg POSTMan or something similar.

Try just sending a POST request to */api/hello*, and you should get back a response that
contains the *args* object received by your handler module.

Now try adding a Body payload.  By default, QEWD REST APIs have a *Content-Type* of *application/json*,
so you should add a JSON Body payload, eg:

        {
          "hello": "world",
          "ok": true,
          "count": 123
        }

Send the request and take a look at the *args* object in the response.  It should now include:

        "body": {
          "hello": "world",
          "ok": true,
          "count": 123
        },

In other words, by the time your handler module is invoked, QEWD has already parsed the JSON Body
payload and it's been put into the *args* object.

So now we can rewrite the handler logic to expect a Body payload and to process it appropriately.
What that logic does is entirely up to you.  Once QEWD invokes your handler, it essentially hands control
over to you.  All it expects is for you to invoke the *finished()* function when you're done and
want to hand control back to QEWD.

So, let's modify the handler module (*~/qewd-baseline/apis/hello\_world\_post/index.js*) to this:


        var isEmpty = require('../../utils/isEmpty');
        
        module.exports = function(args, finished) {
          if (isEmpty(args.req.body)) {
            return finished({error: 'No body payload sent in the request'});
          }
          if (!args.req.body.hello) {
            return finished({error: 'Missing hello property in the body payload'});
          }
          finished({
            ok: true,
            hello: args.req.body.hello
          });
        };

Notice that we're going to make use of a handy little utility module that comes with
*qewd-baseline*: */utils/isEmpty*.  This is a utility to use to confirm whether or not
a Body payload was actually sent.  As you can see, if *args.req.body* was empty, then we're
returning an error.

Then we check to ensure that the *body* has a *hello* property.  If not, it will again return
an error.

Otherwise, for now we're just going to signal success by returning an object containing *ok: true* and
the *hello* property from the *body*, along with the value it contained.

Save this new version of your handler module.

**IMPORTANT**: Remember that you now need to stop all the QEWD Worker Processes using the *QEWD-Monitor*
application.

When you've done that, try POSTing examples of this API:

- try it without a body at all.  You should get back the first error
- try it with a body that doesn't include a *hello* property.  This time you should see the
second error
- then try it with a valid *body*, eg:

        {
          "hello": "world"
        }

This time you should see the successful response:

        {
          "ok": true,
          "hello": "world"
        }

You now know how to handle and process a POST request with a Body!

Note that the identical approach applies to a PUT request with a Body payload.  Try adding a new
API route for a PUT version of the API Route to see for yourself.


### POSTing Forms as *application/x-www-form-urlencoded* Content

If you wish, you can use a Content-Type of *application/x-www-form-urlencoded* when POSTing
forms (ie instead of *application/json*).  The difference is that the Body payload must now
be a string of name/value pairs, eg:

        username=rtweed&password=secret

However, as far as your API handler method is concerned, there is no change.  By the time your
API handler method is invoked by QEWD, the Body payload name/value pairs will have been parsed and
put into the *args.req.body* object exactly as before, eg:

        "body": {
          "username": "rtweed",
          "password": "secret"
        }, ...


## URI Path variables

A common requirement of REST APIs is for various parts of the URI path to convey values.

For example, consider how we might design a REST API to fetch details of all
the people in a database who have a particular last-name and who live in a particular
town.  We might decide to create a REST API whereby I could make this request:

    GET /api/person/Tweed/town/Redhill

which would request all the records for people named *Tweed* who live in *Redhill*.

To implement an API like this, we need a way of defining a route where the 3rd part of
the URI path represented the *lastName* and the 5th part represented the *town* in our database.

QEWD makes this very straightforward.  Just add this API Route definition to the *routes.json*
array:

          {
            "uri": "/api/person/:lastName/town/:town",
            "method": "GET",
            "handler": "get_people"
          },

In other words, we simply represent variable parts of the URI path by using a prefix of : followed
by a field name.

So how do we process that in the *get_people* handler module that we'll use to proess it?

Let's just use that handler code that echoes back the *args* object.  Create
*~/qewd-baseline/apis/get_people/index.js* with the content:


        module.exports = function(args, finished) {
          finished(args);
        };

and restart the QEWD Container (since we updated *routes.json*).

Try the request (in either a browser or REST Client):

       GET /api/person/Tweed/town/Redhill

You should see the *args* object in the response, and, if you take a look, it will contain:

       {
         lastName: "Tweed",
         town: "Redhill",

So, by the time your handler module is invoked, QEWD has already parsed out any variable
fields in the incoming URI path, and put the values into the *args* object as properties named
as per the URI path variable name.

So, knowing this, we can now write a proper handler method to fetch the records from the
database.

Of course, we don't currently have a database of such details, so for now let's just simulate it
with an array, and do a search for matching records in our handler:


        var test_data = [
          {
            firstName: 'Rob',
            lastName: 'Tweed',
            city: 'Redhill',
            gender: 'Male'
          },
          {
            firstName: 'Simon',
            lastName: 'Tweed',
            city: 'St Albans',
            gender: 'Male'
          },
          {
            firstName: 'Susanne',
            lastName: 'Salling',
            city: 'Redhill',
            gender: 'Female'
          },
          {
            firstName: 'Chris',
            lastName: 'Munt',
            city: 'Banstead',
            gender: 'Male'
          },
          {
            firstName: 'Jane',
            lastName: 'Smith',
            city: 'London',
            gender: 'Female'
          },
          {
            firstName: 'Ian',
            lastName: 'Jones',
            city: 'Edinburgh',
            gender: 'Male'
          },
          {
            firstName: 'Michael',
            lastName: 'Ryan',
            city: 'Leeds',
            gender: 'Male'
          },
          {
            firstName: 'Jane',
            lastName: 'Tweed',
            city: 'Redhill',
            gender: 'Female'
          },
        ];
        
        
        module.exports = function(args, finished) {
          var results = [];
          test_data.forEach(function(record) {
            if (record.lastName === args.lastName && record.city === args.town) {
              results.push(record);
            }
          });
          finished(results);
        };

Remember to stop the QEWD Worker processes, and then try the request again:

       GET /api/person/Tweed/town/Redhill

and this time you should see the response:

        [
          {
            firstName: "Rob",
            lastName: "Tweed",
            city: "Redhill",
            gender: "Male"
          },
          {
            firstName: "Jane",
            lastName: "Tweed",
            city: "Redhill",
            gender: "Female"
          }
        ]

So now you know how to write REST APIs with variables within the URI path.  As you've probably guessed, 
you can have as many variables as you like.  However, note that they **cannot** be used in the first 2 parts of the
URI path.


# Using 3rd Party Node.js Modules in your Handler Module

One of the amazingly powerful things about using Node.js is the massive ecosystem of 3rd-party
modules that are available on NPM.

QEWD allows you to use any 3rd-party Node.js Modules you want or need to assist in your
API handler logic.  

However, in order to use 3rd-party modules in the Dockerised version of QEWD, you must tell it
to install them when it first starts up.

## Installing 3rd-Party Modules

You do this using a special file named *install_modules.json* which QEWD will look for in the
base directory (*~/qewd-baseline* in our case) during startup.

So, for example, let's suppose we want to make use of the *moment* module for date handling in 
one or more of our API handlers. 

Create the file:

        ~/qewd-baseline/install_modules.json

and copy and paste this as its contents:

        ["moment"]

Save it and restart the QEWD Container.

Now start monitoring its log:

        docker logs -f qewd

and scroll back to where it started and you should see these lines:

        starting up Docker Orchestrator service
        
        Installing module moment to /opt/qewd/mapped
        npm WARN saveError ENOENT: no such file or directory, open '/opt/qewd/mapped/package.json'
        npm notice created a lockfile as package-lock.json. You should commit this file.
        npm WARN enoent ENOENT: no such file or directory, open '/opt/qewd/mapped/package.json'
        npm WARN mapped No description
        npm WARN mapped No repository field.
        npm WARN mapped No README data
        npm WARN mapped No license field.

        + moment@2.24.0
        added 1 package from 6 contributors and audited 1 package in 0.557s
        found 0 vulnerabilities

        moment installed


You can safely ignore the warning, but you can see that it has now loaded the *moment* module
from NPM.

Furthermore, if you now look in the *~/qewd-baseline* folder, you'll now see that a sub-folder named
*node_modules* has appeared.  This will contain the *moment* module and any of its dependent modules.

Try restarting the QEWD Container and see what happens this time in the log:

        starting up Docker Orchestrator service
        
        Installing module moment to /opt/qewd/mapped
        moment already installed

Because the *moment* module was saved into the *node_modules* folder within the mapped volume,
it's there for QEWD whenever you subsequently restart it.  If you use a lot of large, dependent
3rd=party modules, this saves a lot of time when restarting QEWD.


## Using 3rd-Party Modules

To use the 3rd-party Node.js Modules that you've loaded into your QEWD Container, you just
*require()* them in your handler modules, just as you would normally do in Node.js.

For example:

        var moment = require('moment');
        
        module.exports = function(args, finished) {
          finished({date: moment('2013-03-01', 'YYYY-MM-DD').format('MMM Do YYYY')});
        };

Note that QEWD will have already loaded a number of modules from NPM for its own purposes,
so you can use any of its dependent modules without having to declare them in the
*install_modules.json* file.

Some particularly useful modules that are already available for you to use include:

- request
- fs-extra
- json-schema
- sax
- traverse
- uuid

You can get the full list by shelling into the QEWD Container:

         docker exec -it qewd bash

and typing:

         ls -l node_modules


# Accessing External Resources from your API

Although you perform your API handler logic within a handler module, you may want/need to
access external resources, eg REST services.

QEWD is quite happy to let you to this.  For example, you could use the *request* module
to make REST requests to an external REST service.  Let's use a well-known test service as
a demonstration:

Change the handler in your *GET /api/hello* handler
(ie *~/qewd-baseline/apis/hello\_world/index.js*) to this:

        var request = require('request');
        var count = 0;
        
        module.exports = function(args, finished) {
          count++;
          var options = {
            uri: 'https://jsonplaceholder.typicode.com/todos/' + count,
            method: 'GET'
          };
          request(options, function(error, response, body) {
            finished(JSON.parse(body));
          });
        };

Remember to stop the Worker Processes before retrying the */api/hello* API again.

This time, each time you invoke it, you'll get the next generated record from the
*jsonplaceholder* REST service.

Note that because we're using an asyncronous piece of logic, the *finished()* 
function **MUST** be called inside the *request* function's callback, so the
QEWD Worker process isn't released back to its available pool until the REST response
from *jsoneplaceholder* has been received.


# Using QEWD-JSdb in your APIs

Although you could use whatever database you like with QEWD (connecting via the appropriate
Node.js interface module), it already comes with an incredibly powerful multi-module database that we
refer to as QEWD-JSdb, and which uniquely exposes its database as persistent Javascript objects.

[Click here](https://github.com/robtweed/qewd-jsdb) to read all about QEWD-JSdb, 
try it out and learn how to use it.

Using QEWD-JSdb in your API handler modules is very straightforward.  Its top-level
object is accessible as *this.documentStore*.

So, to instantiate a QEWD-JSdb Document Node Object within an API handler module you simply do 
something like this:

        module.exports = function(args, finished) {

          var jsdbDoc = this.documentStore.use('myDocument', 'demo');

          // now you can manipulate and use this QEWD-JSdb Document Node


        };

Everything that is described in, and that you can learn in the QEWD-JSdb showcase repository
is available to you in your API Handler methods.

Let's revisit that person database example.  It could be rewritten like this to use
QEWD-JSdb:

        var test_data = [
          {
            firstName: 'Rob',
            lastName: 'Tweed',
            city: 'Redhill',
            gender: 'Male'
          },
          {
            firstName: 'Simon',
            lastName: 'Tweed',
            city: 'St Albans',
            gender: 'Male'
          },
          {
            firstName: 'Susanne',
            lastName: 'Salling',
            city: 'Redhill',
            gender: 'Female'
          },
          {
            firstName: 'Chris',
            lastName: 'Munt',
            city: 'Banstead',
            gender: 'Male'
          },
          {
            firstName: 'Jane',
            lastName: 'Smith',
            city: 'London',
            gender: 'Female'
          },
          {
            firstName: 'Ian',
            lastName: 'Jones',
            city: 'Edinburgh',
            gender: 'Male'
          },
          {
            firstName: 'Michael',
            lastName: 'Ryan',
            city: 'Leeds',
            gender: 'Male'
          },
          {
            firstName: 'Jane',
            lastName: 'Tweed',
            city: 'Redhill',
            gender: 'Female'
          },
        ];
        
        
        module.exports = function(args, finished) {

          var personDoc = this.documentStore.use('person');
          var dataDoc = personDoc.$('data');
          var indexDoc = personDoc.$(['index', 'by_name_and_city']);
          // create the database if it doesn't already exist
          if (!personDoc.exists) {
            test_data.forEach(function(record) {
              var id = personDoc.$('next_id').increment();
              dataDoc.$(id).setDocument(record);
              indexDoc.$([record.lastName, record.city, id]).value = '';
            });
          }

          // get matches from the database, using the lastname & city index
          var results = [];
          indexDoc.$([args.lastName, args.town]).forEachChild(function(id) {
            results.push(dataDoc.$(id).getDocument());
          });

          finished(results);
        };


Now, instead of an exhaustive search through the data array, it's using a super-fast and efficient
index by a combination of lastName and city.

Notice that the first time this handler is run, it will build the QEWD-JSdb database and index.
Subsequently it will simply search directly from the database.

If you're interested in the performance of QEWD and QEWD-JSdb, take a look at the response header
 *X-Response-Time* that you'll see is returned automatically with every QEWD REST response.  This
is the total time that it took between:

- QEWD's master process receiving the incoming request; and
- QEWD's master process receiving your handler's response from the Worker Process that handled the request,
immediately before Express returned the response.

Depending on your hardware and the complexity of your processing, you'll probably see response times
in the low number of milliseconds, particularly if you use QEWD-JSdb as your database.  QEWD and
QEWD-JSdb is **very** fast, as you will discover!


# Using QEWD Sessions in your APIs for State Management and User Authentication

Although REST APIs are intended to be stateless, it is nevertheless convenient or necessary
to maintain state.  At the very least, you'll often want users to authenticate via a login
API before allowing them access to your APIs.  Having done so, you may also want to be able
to maintain state information (eg to avoid them having to repeatedly send the same information
with each request).

QEWD makes this very simple to set up and manage by allowing you to establish what are called
QEWD Sessions, each of which is identified by an opaque, randomly-generated token.

Let's build a simple demonstration of how to use QEWD Sessions in your REST APIs.

We'll start by adding a Login API.

First add this Route to your *routes.json* configuration file
(*~/qewd-baseline/configuration/routes.json*):

          {
            "uri": "/api/login",
            "method": "POST",
            "handler": "login"
          },

Then we can create the *login* handler method (*~/qewd-baseline/apis/login/index.js*).
Let's set up a simple QEWD-JSdb database to use for user authentication:


        var users = [
          {
            username: 'rtweed',
            password: 'secret'
          },
          {
            username: 'stweed',
            password: 'verysecret',
          }
        ];
        

        var isEmpty = require('../../utils/isEmpty');

        module.exports = function(args, finished) {

          // make sure the user sent a username and password as a body payload

          var body = args.req.body;
          if (isEmpty(body)) {
            return finished({error: 'No login credentials were sent'});
          }
          if (!body.username || body.username === '' || !body.password || body.password === '') {
            return finished({error: 'Incomplete login credentials'});
          }
          // username and password found.  Now check the database to check they are valid
          // First set up the Document Node Objects we'll need

          var authDoc = this.documentStore.use('authentication');
          var dataDoc = authDoc.$('data');
          var indexDoc = authDoc.$(['index', 'by_username']);

          // create the database if it doesn't already exist
          if (!authDoc.exists) {
            users.forEach(function(record) {
              var id = authDoc.$('next_id').increment();
              dataDoc.$(id).setDocument(record);
              indexDoc.$(record.username).value = id;
            });
          }

          // The authentication database exists, so
          // check username exists in the database, and if so that the password matches

          var username = body.username;
          if (!indexDoc.$(username).exists) {
            return finished({error: 'Invalid login attempt'});
          }
          var id = indexDoc.$(username).value;
          if (dataDoc.$([id, 'password']).value !== body.password) {
            return finished({error: 'Invalid login attempt'});
          }

          // The user has entered a valid username and password.
          // Now create a new QEWD Session for the user and
          // return the token

          var session = this.sessions.create('demo_app', 3600);
          session.authenticated = true;
          finished({
            ok: true,
            token: session.token
          });
        };

If you don't understand the QEWD-JSdb code in the above example, you should take the 
[tutorial](https://github.com/robtweed/qewd-jsdb/blob/master/REPL.md)

Hopefully the example above is otherwise self-explanatory, but the one bit that probably needs an
explanation is the *this.sessions.create()* line:

QEWD's *this* context includes the *this.sessions* object with which you can establish a new
QEWD Session by using its *create()* method.  The QEWD Session that is returned is an object that is backed by
a QEWD-JSdb database.  The *create()* method's arguments are:

- application_name: A name you provide for the notional application we're applying the session to
- session_timeout: The number of seconds, beyond which, if there has been no session activity for the
user's session, it is flagged as expired/timed out.  At regular intervals, behind the scenes, QEWD will clear 
down expired sessions from the QEWD-JSdb database.

You can also see that we've used two of the properties of the *session* object that was created:

- authenticated: *true* | *false*.  A read/write flag that denotes whether or not the user successfully authenticated
- token: contains the randomly-generated, opaque *uuid*-formatted token that uniquely identifies 
this user *session*.

So let's try this first step out.  You'll need to restart the QEWD Container, since we've updated
*routes.json*, and then use a REST Client to POST a username & password, eg

        POST /api/login
        Body payload: {username: 'rtweed', password: 'secret'}

If all went well you should have received a response similar to this:

        {
          "ok": true,
          "token": "a2e95896-fa9b-4889-a164-f0095b5ff7b1"
        }

At this point, it's worth starting the QEWD-Monitor application (which, during API development
you should have open anyway, since you need to keep stopping those QEWD Worker processes each time
you modify your API method logic!)

In the QEWD-Monitor, click the *Sessions* tab that you'll see in the top banner. You should now
see a session named *demo_app* in the list.  If not, try clicking the green *refresh* button at the
right-hand end of the *Sessions* panel banner.

You can then click the blue button next to the *demo_app* session to drill down through its
QEWD-JSdb contents.  You'll see the *token* and *authenticated* property values in there, along
with the *expiry* epoch value and the *timeout* which should be the 3600 seconds we specified when
we used the *create()* method.

Now that we have a user session established, we can use it to:

- authenticate subsequent requests from the user
- optionally persist information from one request to re-use in a later one

So let's modify the original *hello\_world* API to only allow its use if the user has authenticated.
We won't need to modify the *routes.json* file since we're modifying an existing Route.

The usual way to apply user authentication in REST APIs is to use the *Authorization* HTTP request
header, and send the token as what's known as a *Bearer* token.  This simply means we'll add
this HTTP header to subsequent API requests:

        Authorization: Bearer a2e95896-fa9b-4889-a164-f0095b5ff7b1

The idea, then, is that our API handler methods (apart from */api/login*) should check for this
header, ensure the token is valid, and if so, make that QEWD Session available within your
handler logic.  

QEWD makes all that very simple by providing you with a method of the *this.sessions* object:

- authenticateRestRequest: checks for the presence or absence of a Bearer token in the
Authorization header of the incoming request.  If present, the token is checked to see
if it is for a valid, unexpired QEWD Session.  If so, it will return true.  Otherwise it
will return false;

Edit the *hello\_world* API handler method (*~/qewd-baseline/apis/hello\_world/index.js*) as follows:

        var request = require('request');
        var count = 0;
        
        module.exports = function(args, finished) {
        
          // Authenticate the user

          var authenticated = this.sessions.authenticateRestRequest(args.req, finished);

          if (!authenticated) {
            // the authenticateRestRequest method will have issued appropriate finished() calls
            return;
          }
        
          // User was successfully authenticated

          count++;
          var options = {
            uri: 'https://jsonplaceholder.typicode.com/todos/' + count,
            method: 'GET'
          };
          request(options, function(error, response, body) {
            finished(JSON.parse(body));
          });
        };


Stop the QEWD Worker processes using the QEWD-Monitor application and try the
*GET /api/hello* API.  This time you'll get errors returned unless you provide
an Authorization header that contains a valid QEWD Session token.  Depending on
how long it took you to create and save this updated version of the handler method,
you may find that you need to POST a new */api/login* request to get a token for a new, unexpired
QEWD Session.

So that's how to authenticate REST API requests.  However, we won't want to replicate this
logic in every API handler method.  QEWD therefore provides a way to define such authentication
logic once and have it applied to every incoming request.  We can make use of the
[QEWD-Up beforeHandler](https://github.com/robtweed/qewd/blob/master/up/docs/Life_Cycle_Events.md#beforehandler)
Event hook.

Simply create a file named *beforeHandler.js* in the */apis* folder, ie:

        ~/qewd-baseline/apis/beforeHandler.js

Cut and paste the *authenticateRestRequest* method call from the *hello\_world* handler method, and edit it to create a module
that looks as shown below.  


        module.exports = function(req, finished) {
        
          // Don't apply authentication to the /api/login request

          if (req.path === '/api/login' && req.method === 'POST') {
            return true;
          }

          // Make sure we also bypass QEWD session authentication for
          // the two built-in REST APIs:

          if (req.path === '/qewd/shutdown' && req.method === 'POST') {
            return true;
          }
          if (req.path === '/jsdb/viewer/refresh' && req.method === 'GET') {
            return true;
          }

          return this.sessions.authenticateRestRequest(req, finished);
        };

Now we can strip back the *hello\_world* API handler method to its original format:

        var request = require('request');
        var count = 0;
        
        module.exports = function(args, finished) {
        
          count++;
          var options = {
            uri: 'https://jsonplaceholder.typicode.com/todos/' + count,
            method: 'GET'
          };
          request(options, function(error, response, body) {
            finished(JSON.parse(body));
          });
        };

OK, save your changes and use the QEWD-Monitor application to stop the Worker processes.  Then try
logging in again, and then try to access the */api/hello* with and without valid authentication.

All the authentication will now be provided by the *beforeHandler* module, and you should now find
that all the APIs you previously created now require authentication before they will run!


There's one final thing to try out: something the *authenticateRestRequest()* will have
done is to make the QEWD Session available
to your API handler methods by adding it to the *req* object.  You'll therefore be able to 
access and use it in your API methods via *args.req.session*.  
*args.req.session.data* is a QEWD-JSdb
Document Node Object, so you can use all the QEWD-JSdb properties and methods to it.

Let's try it and see.  Edit your *hello\_world* API handler method:

        var request = require('request');
        
        module.exports = function(args, finished) {
        
          var session = args.req.session.data; // get the Session Document Node object
          var count = session.$('count').increment();  // Use the session to control the counter
          
          var options = {
            uri: 'https://jsonplaceholder.typicode.com/todos/' + count,
            method: 'GET'
          };
          request(options, function(error, response, body) {
            // add some stuff to the QEWD Session:
            
            session.$('updated').value = Date.now(); // record the date/time in the session
            var response = JSON.parse(body);  
            session.$(['records', count]).setDocument(response);  // save the fetched record into the session
             
            finished(response);
          });
        };

Stop the Worker Processes and try this API a few times, and check how the Session contents change in the
QEWD-Monitor application's *Sessions* tab.


# Using JWTs in your APIs for State Management and User Authentication

JSON Web Tokens (JWT) provide an interesting alternative to back-end QEWD Sessions, and can be
used for both user authentication and state management.

## A Quick Primer of JWTs

JWTs are really nothing more that a JSON object which is digitally signed using a secret key and
then Base64 encoded.  They are normally created on a server, and sent to the client / browser 
instead of a session token.

Only the server(s) know the secret key, so only the server can modify a JWT (because, in doing so,
the digital signature will change).

However, anyone, including the browser, can read the contents of a JWT.

Unlike a QEWD Session, JWTs aren't stored at the back-end in a database, but sent to the browser/client,
where they are often persisted as a Cookie or in the browser's local storage.

The JSON payload of a JWT includes a number of mandatory properties (or *claims* in JWT parlance),
but they can potentially contain any payload you want: they are just JSON.

So, they can be used as an alternative to back-end Session storage, and instead the storage is
being done on the client instead.

## Making Use of JWTs in QEWD

The easiest way to see how they are used in QEWD is to review the example that was described
above in the QEWD Session section.  We can change it to use JWTs to achieve the same
result as using the back-end QEWD session.

### The */api/login* Handler Module

The first thing to modify is the handler module for the *POST /api/login* API.

In fact the only part we need to change is these lines at the end:

          // The user has entered a valid username and password.
          // Now create a new QEWD Session for the user and
          // return the token

          var session = this.sessions.create('demo_app', 3600);
          session.authenticated = true;
          finished({
            ok: true,
            token: session.token
          });


Change them to the following

          // The user has entered a valid username and password.
          // Now create a new JWT for the user and return it

          // First create the basic minimum JWT payload using the incoming request
          //  Set the JWT expiry/timeout to 1 hour

          var payload = this.jwt.handlers.createRestSession.call(this, args, 3600);

          // now we'll update/augment the JWT payload

          payload.username = username;
          payload.authenticated = true;

          // and finally package up the payload as a signed JWT string

          var jwt = this.jwt.handlers.encodeJWT.call(this, payload);

          // and return the JWT to the client

          finished({
            ok: true,
            jwt: jwt
          });


So you can see that we can make use of two methods that QEWD provides via its built-in 
*this.jwt.handlers* object:

- createRestSession: creates a basic minimal JWT payload from a REST API request
- encodeJWT: digitally signs and Base64-encodes a payload to create a JWT.

Make sure you set their context using *this* by invoking them with *call()*.

Stop the QEWD Worker processes using the QEWD-Monitor application and try logging in again
using a *POST /api/login* request.  This time you should see a response similar to this:

        {
          "ok": true,
          "jwt": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE1NzU3MzE3MTQsImlhdCI6MTU3NTcyODExNCwiaXNzIjoicWV3ZC5qd3QiLCJhcHBsaWNhdGlvbiI6ImFwaSIsImlwQWRkcmVzcyI6Ijo6ZmZmZjo4MS4xNDMuMjIzLjIyOSIsInRpbWVvdXQiOjM2MDAsImF1dGhlbnRpY2F0ZWQiOnRydWUsInFld2QiOnt9LCJxZXdkX2xpc3QiOnsiaXBBZGRyZXNzIjp0cnVlLCJhdXRoZW50aWNhdGVkIjp0cnVlfSwidXNlcm5hbWUiOiJydHdlZWQifQ.XVJa4_B7tqw73LESIQtFBcBreqTF4Qj9SzI-bSeirvM"
        }

Let's take a look at the contents of the JWT that we received.  For this, I'd recommend using
the [jwt.io](https://jwt.io/) site.

Scroll down to their *Debugger* and, under the *Encoded* column, copy and paste the JWT value you
received back from the */api/login* request.  In the right-hand column (*Decoded*), you'll see
the decoded JSON payload, eg:

        {
          "exp": 1575731714,
          "iat": 1575728114,
          "iss": "qewd.jwt",
          "application": "api",
          "ipAddress": "::ffff:192.168.1.229",
          "timeout": 3600,
          "authenticated": true,
          "qewd": {},
          "qewd_list": {
            "ipAddress": true,
            "authenticated": true
          },
          "username": "rtweed"
        }

You can ignore the *qewd* and *qewd-list* claims for now.  But you can see the properties we added
to it: *username*, *timeout* and *authenticated*.

Notice that we didn't store anything on the QEWD Server this time.


### User Authentication using the JWT

We can now use the JWT instead of the QEWD Session Token to validate the patient.  The browser
or REST client cannot
change the JWT, or create one of its own, because it doesn't have access to the JWT Secret used
by the QEWD Server.

#### Where does the JWT Secret Come From?

If you're wondering how the QEWD Server's JWT Secret was defined, take a look in the *config.json*
file, ie:

        ~/qewd-baseline/configuration/config.json

YOu'll see the *jwt.secret* has a uuid-formatted value.  That value was originally created
when QEWD was started for the first time.  You can change it at any time, and if you restart
the QEWD Container, it will use the new value in *config.json* as its JWT secret.  Note that if you
do so, any JWT sent from a browser that had previously received it from QEWD will no longer be
valid.

#### USing the JWT as a Bearer Token

REST requests should now be changed to use the JWT value in the *Authorization* HTTP Request header,
formatted as a Bearer Token, eg:

        Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE1NzU2NDQ0MDAsImlhdCI6MTU3NTY0NDEwMCwiaXNzIjoicWV3ZC5qd3QiLCJhcHBsaWNhdGlvbiI6ImFwaSIsImlwQWRkcmVzcyI6Ijo6ZmZmZjo4MS4xNDMuMjIzLjIyOSIsInRpbWVvdXQiOjM2MDAsImF1dGhlbnRpY2F0ZWQiOnRydWUsInFld2QiOnt9LCJxZXdkX2xpc3QiOnsiaXBBZGRyZXNzIjp0cnVlLCJhdXRoZW50aWNhdGVkIjp0cnVlfSwidXNlcm5hbWUiOiJydHdlZWQifQ.xBnT4GHk1pu67T1_cb4S2cAn8FQ6yvxhcGcYgJ_hbf0


#### Authenticating Incoming Requests using the JWT

In the previous example, user authentication of all other APIs was handled by the *beforeHandler.js*
module.  We need to modify its logic to use the JWT rather than the QEWD Session Token.  Once again,
QEWD provides a method that looks after this for you.  Edit the */apis/beforeHandler.js* file and
change it from:

        module.exports = function(req, finished) {

          // Don't apply authentication to the /api/login request

          if (req.path === '/api/login' && req.method === 'POST') {
            return true;
          }

          // Make sure we also bypass QEWD session authentication for
          // the two built-in REST APIs:

          if (req.path === '/qewd/shutdown' && req.method === 'POST') {
            return true;
          }
          if (req.path === '/jsdb/viewer/refresh' && req.method === 'GET') {
            return true;
          }

          return this.sessions.authenticateRestRequest(req, finished);

        };

to this:

        module.exports = function(req, finished) {

          // Don't apply authentication to the /api/login request

          if (req.path === '/api/login' && req.method === 'POST') {
            return true;
          }

          // Make sure we also bypass QEWD session authentication for
          // the two built-in REST APIs:

          if (req.path === '/qewd/shutdown' && req.method === 'POST') {
            return true;
          }
          if (req.path === '/jsdb/viewer/refresh' && req.method === 'GET') {
            return true;
          }

          return this.jwt.handlers.validateRestRequest.call(this, req, finished);

        };

In summary, we just replaced QEWD's Session authentication API:

          return this.sessions.authenticateRestRequest(req, finished);

with QEWD's JWT validation API:

          return this.jwt.handlers.validateRestRequest.call(this, req, finished);

This JWT *validateRestRequest()* method:

- checks for an Authorization header containing a JWT as a Bearer Token
- checks the JWT's signature
- checks if the JWT has expired
- unpacks the JWT's payload into *this.session*


We can also modify the *hello\_world* handler method to use the JWT for state management instead of
a back-end QEWD Session, eg:

        var request = require('request');
        
        module.exports = function(args, finished) {
           
          // get the JWT payload that was created for us by the
          // validateRestRequest() method in the beforeHandler module
          
          var jwt = args.req.session;
           
          // initialise and/or increment a counter in the JWT
          
          jwt.count = jwt.count || 0;
          jwt.count = jwt.count + 1;
          
          // send the request to the external REST service as before
          
          var options = {
            uri: 'https://jsonplaceholder.typicode.com/todos/' + jwt.count,
            method: 'GET'
          };
          var _this = this;
          request(options, function(error, response, body) {
            // add some stuff to the QEWD Session:
             
            Add the parsed JSON response to the JWT along with a timestamp
            
            jwt.updated = Date.now();
            var response = JSON.parse(body);
            if (!jwt.records) {
              jwt.records = [];
            }
            jwt.records.push(response);
                         
            // return the updated JWT along with the response
            
            finished({
              response: response,
              jwt: _this.jwt.handlers.encodeJWT.call(_this, jwt)
            });
          });
        };

The client should use the updated JWT it receives in the response as the Authentication header
Bearer Token value.

That's pretty much all there is to using JWTs in QEWD REST APIs.  QEWD automates pretty much
everything for you through just 3 or 4 APIs.


