import * as vscode from 'vscode';

export function setVSCodeWorkspaceManagerViewInExplorerShow() {
    const vscodeWorkspaceManagerViewInExplorerShow = !!vscode.workspace
        .getConfiguration('vscodeWorkspaceManager')
        .get('showInExplorer');

    vscode.commands.executeCommand(
        'setContext',
        'vscodeWorkspaceManagerViewInExplorerShow',
        vscodeWorkspaceManagerViewInExplorerShow,
    );
}
