'use strict';

// import * as nls from 'vscode-nls';
import { ExtensionContext, extensions } from 'vscode';
import { registerCommands } from './commands';
import { configuration, Configuration } from './configuration';
import {
    extensionOutputChannelName,
    extensionQualifiedId,
    CommandContext,
    setCommandContext
} from './constants';
import { Container } from './container';
import { Environment } from './environment';
import { Logger } from './logger';
import { IConfig, IOutputLevel } from './model/config';
import { Notifier } from './notifier';
import { state } from './state';
import * as telemetry from './telemetry';
import { cacheWorkspace } from './cache/cacheWorkspace';
import { registerViews } from './views';

// The example uses the file message format.
// const localize = nls.loadMessageBundle();

export const notifier: Notifier = new Notifier(
    'workspaceManager.cacheWorkspace'
);

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export async function activate(context: ExtensionContext): Promise<void> {
    const start = process.hrtime();

    setCommandContext(CommandContext.Enabled, true);

    state.context = context;
    state.environment = new Environment();

    Logger.configure(
        context,
        configuration.get<IOutputLevel>(
            configuration.name('outputLevel').value
        ),
        o => undefined
    );

    telemetry.activate(context);

    const workspaceManager = extensions.getExtension(extensionQualifiedId)!;
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

    // const disposables = [];

    // disposables.push(
    //     vscode.commands.registerCommand(
    //         'workspaceManager.saveWorkspace',
    //         () => saveWorkspaceCommand()
    //     )
    // );
    // disposables.push(
    //     vscode.commands.registerCommand(
    //         'workspaceManager.switchWorkspace',
    //         (workspaceEntry?: WorkspaceEntry) =>
    //             workspaceEntry
    //                 ? switchToWorkspaceCommand(workspaceEntry, false)
    //                 : switchWorkspaceCommand(false)
    //     )
    // );
    // disposables.push(
    //     vscode.commands.registerCommand(
    //         'workspaceManager.switchWorkspaceInNewWindow',
    //         (treeItem?: TreeItem) =>
    //             treeItem
    //                 ? switchToWorkspaceCommand(treeItem.workspaceEntry, true)
    //                 : switchWorkspaceCommand(true)
    //     )
    // );
    // disposables.push(
    //     vscode.commands.registerCommand(
    //         'workspaceManager.deleteWorkspace',
    //         (treeItem?: TreeItem) =>
    //             treeItem
    //                 ? deleteWorkspace(treeItem.workspaceEntry, true)
    //                 : deleteWorkspaceCommand()
    //     )
    // );
    // disposables.push(
    //     vscode.commands.registerCommand(
    //         'workspaceManager.reloadWorkspaces',
    //         () => refreshTreeDataCommand()
    //     )
    // );
    // disposables.push(
    //     vscode.commands.registerCommand(
    //         'workspaceManager.closeWorkspace',
    //         () => closeWorkspaceCommand()
    //     )
    // );

    // const treeDataProvider = new TreeDataProvider();

    // window.registerTreeDataProvider(
    //     'workspaceManager.viewInActivityBar',
    //     treeDataProvider
    // );
    // window.registerTreeDataProvider(
    //     'workspaceManager.viewInExplorer',
    //     treeDataProvider
    // );

    // disposables.push(
    //     vscode.commands.registerCommand(
    //         'workspaceManager.treeData.refresh',
    //         () => treeDataProvider.refresh()
    //     )
    // );

    // context.subscriptions.push(...disposables);

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
