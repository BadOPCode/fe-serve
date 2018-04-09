import * as React from "react";

interface IInstallProps {}
interface IInstallState {}

export class Install extends React.Component<IInstallProps, IInstallState> {
    render() {
        return ( 
            <div>
                <div className={ "sub-title" }>
                    Installing Fullstack Serve
                </div>
                <div>
                    Fullstack Serve is designed to be used in parallel to NPM projects. 
                    If your project is not a Node JS project you can create a blank directory and follow the directions bellow and configure it to work with your project. 
                    Scripts can be added to control NPM outside of the fullstack directory. 
                    Alternatively you can install it as a global and type <code>fullstack</code> anywhere there is a package.json.
                </div>
                <div>
                    To install use NPM and type...
                </div>
                <div>
                    <code>npm i -D fullstack-serve</code>
                    <div>After installing as a dev dependency you than need to add some configuration to your package.json.</div>
                    In the scripts section you can add...
                    <pre>
                        scripts:<br /> 
                        &nbsp;&nbsp;"serve": "fullstack"<br />
                        &nbsp;&nbsp;...
                    </pre>
                    To run you just need to run <code>npm run serve</code>
                </div>
            </div>
        )
    }
}