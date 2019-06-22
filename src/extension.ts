// import * as nls from 'vscode-nls';
import { ExtensionContext, extensions, window } from 'vscode';
import { registerCommands } from './commands';
import { configuration, Configuration } from './configuration';
import { extensionOutputChannelName, extensionQualifiedId } from './constants';
import { Container } from './container';
import { Environment } from './environment';
import { Logger } from './logger';
import { IConfig, OutputLevel } from './model/config';
import { state } from './state';
import { TreeDataProvider } from './tree-view/explorer/treeDataProvider';
import { setWorkspaceManagerEmpty } from './util/setWorkspaceManagerEmpty';
import { setWorkspaceManagerViewInActivityBarShow } from './util/setWorkspaceManagerViewInActivityBarShow';
import { setWorkspaceManagerViewInExplorerShow } from './util/setWorkspaceManagerViewInExplorerShow';
import { cacheWorkspace } from './util/cacheWorkspace';
import { Notifier } from './notifier';

// The example uses the file message format.
// const localize = nls.loadMessageBundle();

export const notifier: Notifier = new Notifier(
    'workspaceManager.cacheWorkspace'
);

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export async function activate(context: ExtensionContext) {
    // const start = process.hrtime();
    state.context = context;
    state.environment = new Environment();

    Logger.configure(
        context,
        configuration.get<OutputLevel>(configuration.name('outputLevel').value),
        o => undefined
    );

    // telemetry.activate(context);

    const workspaceManager = extensions.getExtension(extensionQualifiedId)!;
    const workspaceManagerVersion = workspaceManager.packageJSON.version;

    Configuration.configure(context);

    try {
        Container.initialize(
            context,
            configuration.get<IConfig>(),
            workspaceManagerVersion
        );

        registerCommands(context);
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
    // disposables.push(listenForConfigurationChanges());

    const treeDataProvider = new TreeDataProvider();

    window.registerTreeDataProvider(
        'workspaceManagerViewInActivityBar',
        treeDataProvider
    );
    window.registerTreeDataProvider(
        'workspaceManagerViewInExplorer',
        treeDataProvider
    );

    // disposables.push(
    //     vscode.commands.registerCommand(
    //         'workspaceManager.treeData.refresh',
    //         () => treeDataProvider.refresh()
    //     )
    // );

    // context.subscriptions.push(...disposables);

    setWorkspaceManagerEmpty();
    setWorkspaceManagerViewInActivityBarShow();
    setWorkspaceManagerViewInExplorerShow();

    // const elapsed = process.hrtime(start);
    // const elapsedMs = elapsed[0] * 1e3 + elapsed[1] / 1e6;
    // telemetry.Reporter.trackEvent(
    //     'activated',
    //     {},
    //     { activateTimeMs: elapsedMs }
    // );

    Logger.log(
        `${extensionOutputChannelName} (v${workspaceManagerVersion}) activated`
    );

    await cacheWorkspace();
}

// this method is called when your extension is deactivated
export function deactivate() {
    // export async function deactivate() {
    Logger.configure(null);
    // return await telemetry.deactivate();
}