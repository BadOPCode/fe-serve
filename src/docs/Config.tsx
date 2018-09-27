import * as React from "react";


interface IConfigProps {}
interface IConfigState {}

export class Config extends React.Component<IConfigProps, IConfigState> {
    render() {
        return ( 
            <div>
                <div className={ "sub-title" }>Configure Fullstack Serve</div>
                <div>
                    Fullstack Serve will look for a package.json where ever you start the server. 
                    At this time the only thing it is concerned with is it's own enytry "fullstack-serve" and no other data needs to be in the package.json. 
                    All Fullstack Serve options are stored within the "fullstack-serve" object.
                </div>
                <h3 id="listen-port">Listen Port</h3>
                <div>
                    <code>"listenPort": &lt;number&gt;</code> 
                    This tells Fullstack Serve what is the port address that the server listens to and where you can connect with a browser at.
                </div>
                <h3 id="pathMaps">pathMaps</h3>
                <div>
                    <code>"pathMaps": {"{}"}</code> Object that contains all the mapped paths.
                    <pre>{`
    "pathMaps": {
        "/static": {
            "type": "static",
            "localPath": "public"
        ,
        "/mock": {
            "type": "mock",
            "mockFile": "&lt;path to a javascript that mocks an API&gt;"
        },
        "/proxy": {
            "type": "proxy",
            "remote": {
                "protocol": "https",
                "hostname": "myapi.awesome.com",
                "path": "/userinfo/v2/",
                "port": 443
            }
        }
    }
                    `}</pre>
                    <code>"&lt;route&gt;": {"{}"}</code>
                    Route is a object. the actual route is string used as a index. 
                    This route will be mapped to the external listener and be accessible from brower.
                    <code>"type": "&lt;string (static | mock | proxy)&gt;"</code>
                    This designates what kind of route this is.                    
                </div>
                <h4 id="Static">pathMap Type Static Route</h4>
                <div>
                    A static route will map a specific file or a directory that will be shared by the server. 
                    If it's a directory and you don't specify a specific file a list of files from that directory will be display. 
                    Static parameters: <code>"localPath": "&lt;string&gt;"</code> 
                    This is the path on your local file system you want this route to share.
                </div>
                <h4 id="Mock">pathMap Type Mock Route</h4>
                <div>
                    A mock route points to a js that outputs a mock of your endpoint. 
                    <code>"mockFile": "&lt;string&gt;"</code>
                    Path to the JS file you wish to be ran when the user accesses the route. 
                    Mocks are a great way of testing front end functionality on endpoints that could do dangerous things if you were to point to the real thing. 
                    Or even if the endpoint hasn't been made yet. 
                    If your endpoint is a microservice I typically add a hostname of the name of the service that points back to my local system. 
                    For example <code>127.0.0.1 api.twitter.com</code> this file in Windows is <code>C:\Windows\System32\drivers\etc\hosts</code> in all other operating systems you will typically find it in <code>/etc/hosts</code>. 
                    Always remember your changes to the hosts file as it will continue to map the host to your local even after rebooting and will cause problems when your trying to test live.
                </div>
                <h4 id="Proxy">pathMap Type Proxy Route</h4>
                <div>
                    A proxy type will map the route to an external API server. 
                    <code>"remote": {}</code> 
                    This is the object that contains information about this proxy route. 
                    <code>"protocol": "&lt;string (http | https)&gt;" "hostname": "&lt;string&gt;"</code> 
                    Host name of the API server. 
                    <code>"path": "&lt;string&gt;"</code> 
                    path on remote server to connect to. 
                    <code>"port": &lt;number&gt;</code> 
                    The port number to connect to remote server on.
                    An import thing about the paths on proxy is that anything beyond the mapped path from the browser that matches will be passed to the remote. 
                    For example in a browser you request the path <code>http://localhost/fetchUser/v2/lastLoggedIn</code> and in your configuration your map is 
                    <pre>{`
    "/fetchUser": {
        "type": "proxy", 
        "remote": { 
            "path":"/logins" 
            ...
                    `}</pre> 
                    Fullstack will pass to the remote <code>"/logins/v2/lastLoggedIn"</code> as the path. 
                    You have to be very careful of rewriting your routes. 
                    In fact it's beter if you can match the remote if it's possible. 
                    Proxies can also be used to pull off static content from a live server that you don't necessarily want to download on to your local dev machine. 
                    In fact predominately this is what I use it for as most microservices are better left accessed as-is.
                </div>
                <h3 id="Watch">Watch Tasks</h3>
                <div>
                    <code>{`"watchTasks": [<tasks>]`}</code>
                    This is a list of task objects that will execute when changes occur that matches the task masks.
                    <pre>{`
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
                    `}</pre>
                    <div>
                        <code>{`"masks": [<masks>]`}</code> 
                        The masks contain a list of file system globs that point towards files you want to include or exclude. 
                        To exclude you need to start the mask with a exclamtion mark (!). 
                        So as an example if I wanted to watch all the typescript files but ignore changes to the unit tests I could write a mask like this... 
                        <code>{`"masks": ["src/**/*.ts", "!src/**/*.spec.ts"]`}</code>
                    </div>
                    <div>
                        <code>{`"tasks": { <type of changes> }`}</code> 
                        This is object that contains all the possible commands I want to run depending on the type of changes. 
                        You can specify any, onAdd, onChange, and onDelete and define one or more.
                    </div>
                    <div>                    
                        <code>{`Change Type "any":"<command>"`}</code> 
                        what ever command is specified here will run on any type of change made. 
                        As of this release all change types run async and you can not rely on a particular order. 
                        So if your using "any" and want it to run before or after you will need to make your own flag system like a dropfile to ensure that happens.
                    </div>
                    <div>                    
                        <code>{`Change Type "onAdd":"<command>"`}</code> 
                        This command will be ran any time that you create a new file that fits the mask pattern.
                    </div>
                    <div>                   
                        <code>{`Change Type "onChange":"<command>"`}</code> 
                        This command will be executed any time you modify a file that matches the mask pattern.
                    </div>
                    <div>                    
                        <code>{`Change Type "onDelete":"<command>"`}</code> 
                        This command is ran anytime you delete a file that matches the mask.
                    </div>
                </div>
            </div>
        )
    }
}