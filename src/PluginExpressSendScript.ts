/**
 * PluginExpressSendScript.ts:
 * This Express plugin sends a file mapped to a route.
 */
export interface IPluginOptions {
    sharePath: string;
    scriptPath: string;
}

export default function SendScript(options: IPluginOptions) {
    const pluginExpressSendScripts = (req: any, res: any, next: () => void) => {
        if (req.path === options.sharePath) {
            res.sendFile( options.scriptPath );
            return;
        }

        next();
    };

    return pluginExpressSendScripts;
}
