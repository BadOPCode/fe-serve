# fullstack-serve
The swiss army web developers tool.

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