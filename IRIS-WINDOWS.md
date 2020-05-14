# QEWD-IRIS: Running QEWD with Cach&eacute; or IRIS Natively on Windows


The instructions below explain how to get QEWD running on a Windows system with Cach&eacute; or IRIS.

# Ensure the Cach&eacute; or IRIS C Callin Service is Enabled

QEWD uses the [*mg-dbx*](https://github.com/chrisemunt/mg-dbx) 
module to integrate with Cach&eacute; and IRIS, and *mg-dbx* requires the
C Callin Interface to be enabled on Cach&eacute; and IRIS.

To check and/or change this, open the Cach&eacute; / IRIS System Management Portal in the usual way.

Next, navigate the System Management Portal menus as follows:

- System Administration
  - Security
    - Services
      - %Service_Callin: Click on the link, then:

- Check the *Service Enabled* box and Click *Save*


# Install Node.js

You first need to [install Node.js](https://nodejs.org) on your Windows machine. Node.js versions 12.x and 14.x are supported.

Do not install earlier versions of Node.js, and if you already have an earlier version of Node.js
installed, you will need to update it.


# Create a QEWD Installation Folder

Create a new folder/direcory on your Windows System where you will run your instance of QEWD.

The directory name is up to you, but in these instructions I'll assume you've created:

        C:\qewd


# Create a *package.json* File

Under this installation folder, create a text file named *package.json*.  This will be used to
control how QEWD is installed and started.  It should pretty much always contain the following:

        {
          "name": "qewd-up",
          "version": "1.0.0",
          "description": "Automated QEWD Builder",
          "author": "Rob Tweed <rtweed@mgateway.com>",
          "scripts": {
            "start": "node node_modules/qewd/up/run_native"
          },
          "dependencies": {
            "qewd": ""
          }
        }


So you should now have a structure like this:

        C:\qewd
            |
            |_ package.json



# Create the QEWD Configuration Folder and Files

## Configuration Folder

Under the installation folder, create a sub-folder named *configuration*, ie you should now have a 
structure like this:


        C:\qewd
            |
            |_ package.json
            |
            |_ configuration


## *config.json* File

Next, create a text file named *config.json* within the *configuration* folder.  

You'll now have the following structure:

        C:\qewd
            |
            |_ package.json
            |
            |_ configuration
                 |
                 |- config.json



At the very minimum it should contain this:

### Cach&eacute;

        {
          "qewd": {
            "database": {
            "type": "dbx",
              "params": {
                "database": "Cache",
                "path": "C:\\Cache\\intersystems\\Mgr",
                "username": "_SYSTEM",
                "password": "SYS",
                "namespace": "USER"
              }
            }
          }
        }


Change the *path*, *username*, *password* and *namespace* properties as per your Cach&eacute;
configuration.

**NOTE 1:** the path **MUST** contain double back-slashes!

**Note 2:** the file must contain valid JSON syntax, so all property names and string values
must be **double-quoted**.  You **cannot** add comments to the file.



### IRIS

        {
          "qewd": {
            "database": {
            "type": "dbx",
              "params": {
                "database": "IRIS",
                "path": "C:\\IRIS\\Mgr",
                "username": "_SYSTEM'",
                "password": "SYS",
                "namespace": "USER"
              }
            }
          }
        }

Change the *path*, *username*, *password* and *namespace* properties as per your Cach&eacute;
configuration.

**NOTE 1:** the path **MUST** contain double back-slashes!

**Note 2:** the file must contain valid JSON syntax, so all property names and string values
must be **double-quoted**.  You **cannot** add comments to the file.


### Optional Properties

There are a number of optional properties that you can add to the *config.json* file. This example
below shows the main ones also being applied:


        {
          "qewd": {
            "managementPassword": "rtyr56jh61!)ye5",
            "serverName": "My QEWD Server",
            "poolSize": 4,
            "port": 8081,
            "database": {
            "type": "dbx",
              "params": {
                "database": "Cache",
                "path": "C:\\Cache\\intersystems\\Mgr",
                "username": "_SYSTEM'",
                "password": "SYS",
                "namespace": "USER"
              }
            }
          }
        }

These additional properties are described below:

- *managementPassword*: Used by the *qewd-monitor* and *qewd-monitor-adminui* applications to authenticate
its use.  Defaults to *keepThisSecret!*.  It is recommended that you always specify your own password
to prevent anyone trying the default!

- *serverName*: allows you to modify the server name displayed in the *qewd-monitor* application.  The
default serverName is *qewd*

- *poolsize*: allows you to specify the maximum number of Worker Processes that QEWD will create.
Keep this at or below your Cach&eacute; or IRIS license limit.  Any excess traffic will be queued
until a Worker Process is available, so you will never run out of license slots when using QEWD.  
As a rough rule of thumb, start with the poolsize equal to one less than the number of CPU cores
you have available.  By default, the poolsize is 1.

- *port*: the port on which QEWD's web server will listen. The *port* defaults to 8080.



## *routes.json* File

If you are going to support REST APIs, you will need to define them in a special file named
*routes.json*.  It does no harm to create a simple *ping* REST API to allow you to quickly
check that your system is available and working correctly, so let's do that now.

The *routes.json* file is created alongside the *config.json* file, ie you'll have the following
structure:


        C:\qewd
            |
            |_ package.json
            |
            |_ configuration
                 |
                 |- config.json
                 |
                 |- routes.json


To define a simple *ping* API, paste the following content into your *routes.json* file:


        [
          {
            "uri": "/api/ping",
            "method": "GET",
            "handler": "ping"
          }
        ]


**Note:** the file must contain valid JSON syntax, so all property names and string values
must be **double-quoted**.  You **cannot** add comments to the file.



# Create an API Handler Method for the *ping* REST API

In the *routes.json* file above, we specified a *handler* property of *ping* for the
*GET /api/ping* route.  QEWD will expect to find all your REST API handler methods
(irrespective of the API path) in a folder named *apis* under your QEWD installation folder, ie:

        C:\qewd
            |
            |_ package.json
            |
            |_ configuration
            |     |
            |     |- config.json
            |     |
            |     |- routes.json
            |
            |- apis


Each handler name is then defined as a sub-folder name within this *apis* folder.  So we'll need to
create:

        C:\qewd
            |
            |_ package.json
            |
            |_ configuration
            |     |
            |     |- config.json
            |     |
            |     |- routes.json
            |
            |- apis
                 |
                 |- ping


And the handler method itself is defined as a JavaScript module file named *index.js*, ie:


        C:\qewd
            |
            |_ package.json
            |
            |_ configuration
            |     |
            |     |- config.json
            |     |
            |     |- routes.json
            |
            |- apis
                 |
                 |- ping
                      |
                      |- index.js


API Handler method modules are described in detail elsewhere.  For now just type this
into your *index.js* file:

        module.exports = function(args, finished) {
          finished({
            ok: true,
            args: args
          });
        };





# Install QEWD

This step only needs doing once.  It installs all the Node.js modules used by the 
QEWD instance used by QEWD-baseline


In a Windows Command Window session, type the following:


        cd \qewd
        npm install


You'll see it installing QEWD, and in your QEWD Installation folder, you'll see a
sub-folder named *node_modules* and a file named *package-lock.json* appear, 
eg your top-level folder structure should look like this:


        C:\qewd
            |
            |_ package.json
            |
            |_ package-lock.json
            |
            |_ configuration
            |
            |- apis
            |
            |- node_modules



When it completes, you're ready to start QEWD


# Starting QEWD

Each time you want to start QEWD, first make sure you're in your QEWD
Installation folder, eg

        cd \qewd

and then start QEWD by typing:

        npm start



QEWD is ready for use when you see this (the poolsize and port will depend on your *config.json* settings):

        ========================================================
        ewd-qoper8 is up and running.  Max worker pool size: 2
        ========================================================
        ========================================================
        QEWD.js is listening on port 8080
        ========================================================


The first time you start QEWD, it installs a bunch of extra things, so you'll see
new sub-folders named *www* and *qewd-apps* appear. QEWD has loaded in everything you need
for monitoring your system and for developing interactive applications.


# Test the *ping* REST API

In a browser, try the REST URL:

        http://x.x.x.x:8080/api/ping

        (change the IP address/ hostname and port as per your configuration)

If everything is working, you should see a response that returns the various
HTTP Request information received by the QEWD Worker Process that handled the
API.


# Developing REST APIs on IRIS with QEWD

To find out how to develop REST Applications with QEWD on your iRIS system, you should
[follow the tutorial](./REST.md).




# Try the QEWD-Monitor Application

Start the QEWD-Monitor application in your browser using the URL:

        http://x.x.x.x:8080/qewd-monitor

or try the latest version:

        http://x.x.x.x:8080/qewd-monitor-adminui


You'll need to enter the QEWD Management password which, by default, is *keepThisSecret!*, but
you may have set it to something else via the *managementPassword* property in your *config.json* file.

You'll now see the Overview panel, from where you can monitor your QEWD run-time environment, view the master and worker process activity.

Click the tabs in the banner to view your IRIS USER namespace Global Storage and inspect any QEWD Sessions.


# Further Information on Developing using QEWD-Up

You now have a fully-working IRIS-based QEWD-Up environment, and you can begin to try building your own applications.

For further information about QEWD-Up:

- [Information and background to QEWD-Up](https://github.com/robtweed/qewd/tree/master/up)
- [Detailed QEWD-Up Documentation](https://github.com/robtweed/qewd/tree/master/up/docs)



# QEWD Application Run-Time Modes

## Interactive Mode

Using the *npm start* command above, the QEWD process will have started in *interactive* mode 
and you will see its log output appearing in your Console window.

In this mode you can manually start, stop and restart QEWD:

### Start QEWD

        npm start

### Stop QEWD

       CTRL&C

or use the QEWD-Monitor application.


## Background Mode

To run QEWD in a production setting, you should set it up to run as a Windows Service.  There
are several ways to do this and tools to manage/automate the process.  One that is worth
checking out is [NSSM](https://www.slideshare.net/robtweed/ewd-3-training-course-part-29-running-ewdxpress-as-a-service-on-windows).




