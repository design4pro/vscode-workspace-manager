import * as vscode from 'vscode';
import { cacheWorkspace } from './cache/cacheWorkspace';
import { registerCommands } from './commands';
import { configuration, Configuration } from './configuration';
import {
    CommandContext,
    extensionOutputChannelName,
    setCommandContext
} from './constants';
import { Container } from './container';
import { Environment } from './environment';
import { Logger } from './logger';
import { IConfig, IOutputLevel } from './model/config';
import { state } from './state';
import * as telemetry from './telemetry';
import { getExtension } from './util/getExtension';
import { registerViews } from './views';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export async function activate(
    context: vscode.ExtensionContext
): Promise<void> {
    const start = process.hrtime();

    setCommandContext(CommandContext.Enabled, true);

    state.context = context;
    state.environment = new Environment();

    Logger.configure(
        context,
        configuration.get<IOutputLevel>(
            configuration.name('advanced')('outputLevel').value
        ),
        o => undefined
    );

    telemetry.activate(context);

    const workspaceManager = getExtension()!;
    const workspaceManagerVersion = workspaceManager.packageJSON.version;

    Configuration.configure(context);

    const cfg = configuration.get<IConfig>();

    try {
        Container.initialize(context, cfg, workspaceManagerVersion);

        registerCommands(context);
        registerViews(context);
    } catch (e) {
        Logger.error(e, 'Error initializing atlascode!');
    }

    const elapsed = process.hrtime(start);
    const elapsedMs = elapsed[0] * 1e3 + elapsed[1] / 1e6;
    telemetry.Reporter.trackEvent(
        'activated',
        {},
        { activateTimeMs: elapsedMs }
    );

    Logger.log(
        `${extensionOutputChannelName} (v${workspaceManagerVersion}) activated`
    );

    await cacheWorkspace();
}

// this method is called when your extension is deactivated
export async function deactivate(): Promise<any> {
    Logger.configure(null);

    return await telemetry.deactivate();
}
