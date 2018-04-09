import * as React from "react";

import "./Home.scss";

interface IHomeProps {}
interface IHomeState {}

export class Home extends React.Component<IHomeProps, IHomeState> {
    render() {
        return ( 
            <div>
                <div>
                    <div className={"sub-title"}>Cool Features</div>
                    <ul>
                        <li>Serve multiple static locations that automatically update the browser with changes. No special code or running in a iframe.</li>
                        <li>Map external endpoints and proxy locally.</li>
                        <li>Create scripts and serve data that mock end points.</li>
                        <li>Create multiple file system watcher tasks.</li>
                        <li>Each watcher task can have multiple wildcard include and exclude filters.</li>
                        <li>Each file watcher task can have different scripts set based on if the filesystem change is a add, change or delete.</li>
                        <li>Easy to include into any project and every developer working on the project has a more uniformed environment.</li>
                        <li>Created for fullstack web developers by a professional fullstack developer.</li>
                        <li>More features being planned!</li>
                    </ul>
                </div>
                <div>
                </div>
            </div>
        )
    }
}