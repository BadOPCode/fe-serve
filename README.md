# fullstack-serve
A swiss army knife utility to help fullstack developers do their jobs and share uniformed environments with other developers.


## Features
 - Serve multiple static locations that automatically update the browser with changes.  No special code or running in a iframe.
 - Map external endpoints and proxy locally.
 - Create scripts and serve data that mock end points.
 - Create multiple file system watcher tasks.
 - Each watcher task can have multiple wildcard include and exclude filters.
 - Each file watcher task can have different scripts set based on if the filesystem change is a add, change or delete.
 - Easy to include into any project and every developer working on the project has a more uniformed environment.
 - Created for fullstack web developers by a professional fullstack developer.
 - More features being planned!


## Installation

Fullstack Serve is designed to be used in parallel to NPM projects. If your project is not a Node JS project you can create
a blank directory and follow the directions bellow and configure it to work with your project.  Scripts can be added to control NPM outside of the fullstack directory.
Alternatively you can install it as a global and type `fullstack` anywhere there is a package.json. 

To install use NPM and type...

`npm i -D fullstack-serve`

After installing as a dev dependency you than need to add some configuration to your package.json.
In the scripts section you can add...

```
scripts:{
    "serve": "fullstack"
    ...
```

To run you just need to run `npm run serve`


## Configuration

Fullstack Serve will look for a package.json where ever you start the server.  At this time the only thing it is concerned with is it's own enytry "fullstack-serve" and no other data needs to be in the package.json.
All Fullstack Serve options are stored within the "fullstack-serve" object.

## Options

`"listenPort": <number>`  This tells Fullstack Serve what is the port address that the server listens to and where you can connect with a browser at.

`"pathMaps": {}` Object that contains all the mapped paths.

    "pathMaps": {
        "/static": {
            "type": "static",
            "localPath": "public"
        },
        "/mock": {
            "type": "mock",
            "mockFile": "<path to a javascript that mocks an API>"
        },
        "/proxy": {
            "type": "proxy",
            "remote": {
                "protocol": "https",
                "hostname": "myapi.awesome.com",
                "path": "/userinfo/v2/",
                "port": 80
            }
        }
    }


`"<route>": {}` Route is a object. the actual route is string used as a index.  This route will be mapped to the external listener and be accessible from brower.

`"type": "<string (static | mock | proxy)>"` This designates what kind of route this is.  
        
A static route will map a specific file or a directory that will be shared by the server.  If it's a directory and you don't specify a specific file a list of files from that directory will be display.
Static parameters:
`"localPath": "<string>"`  This is the path on your local file system you want this route to share.

A mock route points to a js that outputs a mock of your endpoint.
`"mockFile": "<string>"` Path to the JS file you wish to be ran when the user accesses the route.
Mocks are a great way of testing front end functionality on endpoints that could do dangerous things if you were to point to the real thing. Or even if the endpoint hasn't been made yet.
If your endpoint is a microservice I typically add a hostname of the name of the service that points back to my local system.  For example `127.0.0.1  api.twitter.com` this file in Windows is `C:\Windows\System32\drivers\etc\hosts` in all other operating systems you will typically find it in `/etc/hosts`.  Always remember your changes to the hosts file as it will continue to map the host to your local even after rebooting and will cause problems when your trying to test live.

A proxy type will map the route to an external API server.
`"remote": {}` This is the object that contains information about this proxy route.
`"protocol": "<string (http | https)>"`
`"hostname": "<string>"` Host name of the API server.
`"path": "<string>"` path on remote server to connect to.
`"port": <number>` The port number to connect to remote server on.

An import thing about the paths on proxy is that anything beyond the mapped path from the browser that matches will be passed to the remote.  For example in a browser you request the path `http://localhost/fetchUser/v2/lastLoggedIn` and in your configuration your map is `"/fetchUser": "type": "proxy", "remote": { "path":"/logins" ...` Fullstack will pass to the remote "/logins/v2/lastLoggedIn" as the path.  You have to be very careful of rewriting your routes.  In fact it's beter if you can match the remote if it's possible.
Proxies can also be used to pull off static content from a live server that you don't necessarily want to download on to your local dev machine.  In fact predominately this is what I use it for as most microservices are better left accessed as-is.

`"watchTasks": [<tasks>]` This is a list of task objects that will execute when changes occur that matches the task masks.

    "watchTasks": [
        {
            "masks": ["src/**/*.js"],
            "tasks": {
                "any": "<task that runs on any chnage>",
                "onAdd": "<task that runs when a file is added>",
                "onChange": "<task that runs when a file has been chnaged>",
                "onDelete": "<task that runs when a file has been deleted>"
            }
        }
    ]


`"masks": [<masks>]` The masks contain a list of file system globs that point towards files you want to include or exclude. To exclude you need to start the mask with a exclamtion mark (!). So as an example if I wanted to watch all the typescript files but ignore changes to the unit tests I could write a mask like this... `"masks": ["src/**/*.ts", "!src/**/*.spec.ts"]`

`"tasks": { <type of changes> }` This is object that contains all the possible commands I want to run depending on the type of changes.  You can specify any, onAdd, onChange, and onDelete and define one or more.

Change Type `"any":"<command>"` what ever command is specified here will run on any type of change made.  As of this release all change types run async and you can not rely on a particular order. So if your using "any" and want it to run before or after you will need to make your own flag system like a dropfile to ensure that happens.

Change Type `"onAdd":"<command>"` This command will be ran any time that you create a new file that fits the mask pattern.

Change Type `"onChange":"<command>"` This command will be executed any time you modify a file that matches the mask pattern.

Change Type `"onDelete":"<command>"` This command is ran anytime you delete a file that matches the mask.
