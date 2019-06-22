// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as nls from 'vscode-nls';
import { configuration } from './configuration';
import { extensionOutputChannelName, extensionQualifiedId } from './constants';
import { Environment } from './environment';
import { LoggerOutput, TraceLevel } from './logger';
import { WorkspaceEntry } from './model/workspaceEntry';
import { state } from './state';
import { TreeDataProvider } from './tree-view/explorer/treeDataProvider';
import { TreeItem } from './tree-view/explorer/treeItem';
import { registerCommands } from './commands/common';
import { setVSCodeWorkspaceManagerEmpty } from './util/setVSCodeWorkspaceManagerEmpty';
import { setVSCodeWorkspaceManagerViewInActivityBarShow } from './util/setVSCodeWorkspaceManagerViewInActivityBarShow';
import { setVSCodeWorkspaceManagerViewInExplorerShow } from './util/setVSCodeWorkspaceManagerViewInExplorerShow';
// import * as telemetry from './telemetry';

// The example uses the file message format.
const localize = nls.loadMessageBundle();

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
    // const start = process.hrtime();
    state.context = context;
    state.environment = new Environment();

    LoggerOutput.configure(
        context,
        configuration.get<TraceLevel>(configuration.name('outputLevel').value),
        o => undefined
    );

    // telemetry.activate(context);

    const vscodeWorkspaceManager = vscode.extensions.getExtension(
        extensionQualifiedId
    )!;
    const vscodeWorkspaceManagerVersion =
        vscodeWorkspaceManager.packageJSON.version;

    registerCommands(context);

    // const disposables = [];

    // disposables.push(
    //     vscode.commands.registerCommand(
    //         'vscodeWorkspaceManager.saveWorkspace',
    //         () => saveWorkspaceCommand()
    //     )
    // );
    // disposables.push(
    //     vscode.commands.registerCommand(
    //         'vscodeWorkspaceManager.switchWorkspace',
    //         (workspaceEntry?: WorkspaceEntry) =>
    //             workspaceEntry
    //                 ? switchToWorkspaceCommand(workspaceEntry, false)
    //                 : switchWorkspaceCommand(false)
    //     )
    // );
    // disposables.push(
    //     vscode.commands.registerCommand(
    //         'vscodeWorkspaceManager.switchWorkspaceInNewWindow',
    //         (treeItem?: TreeItem) =>
    //             treeItem
    //                 ? switchToWorkspaceCommand(treeItem.workspaceEntry, true)
    //                 : switchWorkspaceCommand(true)
    //     )
    // );
    // disposables.push(
    //     vscode.commands.registerCommand(
    //         'vscodeWorkspaceManager.deleteWorkspace',
    //         (treeItem?: TreeItem) =>
    //             treeItem
    //                 ? deleteWorkspace(treeItem.workspaceEntry, true)
    //                 : deleteWorkspaceCommand()
    //     )
    // );
    // disposables.push(
    //     vscode.commands.registerCommand(
    //         'vscodeWorkspaceManager.reloadWorkspaces',
    //         () => refreshTreeDataCommand()
    //     )
    // );
    // disposables.push(
    //     vscode.commands.registerCommand(
    //         'vscodeWorkspaceManager.closeWorkspace',
    //         () => closeWorkspaceCommand()
    //     )
    // );
    // disposables.push(listenForConfigurationChanges());

    const treeDataProvider = new TreeDataProvider();

    vscode.window.registerTreeDataProvider(
        'vscodeWorkspaceManagerViewInActivityBar',
        treeDataProvider
    );
    vscode.window.registerTreeDataProvider(
        'vscodeWorkspaceManagerViewInExplorer',
        treeDataProvider
    );

    // disposables.push(
    //     vscode.commands.registerCommand(
    //         'vscodeWorkspaceManager.treeData.refresh',
    //         () => treeDataProvider.refresh()
    //     )
    // );

    // context.subscriptions.push(...disposables);

    setVSCodeWorkspaceManagerEmpty();
    setVSCodeWorkspaceManagerViewInActivityBarShow();
    setVSCodeWorkspaceManagerViewInExplorerShow();

    // const elapsed = process.hrtime(start);
    // const elapsedMs = elapsed[0] * 1e3 + elapsed[1] / 1e6;
    // telemetry.Reporter.trackEvent(
    //     'activated',
    //     {},
    //     { activateTimeMs: elapsedMs }
    // );

    LoggerOutput.log(
        `${extensionOutputChannelName} (v${vscodeWorkspaceManagerVersion}) activated`
    );
}

// this method is called when your extension is deactivated
export function deactivate() {
    // export async function deactivate() {
    LoggerOutput.configure(null);
    // return await telemetry.deactivate();
}
