import * as React from "react";

interface IWhatsNextProps {}
interface IWhatsNextState {}

export class WhatsNext extends React.Component<IWhatsNextProps, IWhatsNextState> {
    render() {
        return ( 
            <div>
                <div className={ "sub-title" }>What's Next</div>
                <div>
                    What is planned for the second release.
                    <ul>
                        <li>Integrated control panel that will let you control Fullstack from a browser.</li>
                        <li>Programmable task lists.</li>
                        <li>Watch list tasks take programmable tasks.</li>
                        <li>Edit and configure package.json from web browser.</li>
                        <li>Proxy cache data locally so route can be accessable offline.</li>
                    </ul>
                </div>
            </div>
        )
    }
}