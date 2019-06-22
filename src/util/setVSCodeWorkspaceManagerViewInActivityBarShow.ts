import * as vscode from 'vscode';

export function setVSCodeWorkspaceManagerViewInActivityBarShow() {
    const vscodeWorkspaceManagerViewInActivityBarShow = !!vscode.workspace
        .getConfiguration('vscodeWorkspaceManager')
        .get('showInActivityBar');

    vscode.commands.executeCommand(
        'setContext',
        'vscodeWorkspaceManagerViewInActivityBarShow',
        vscodeWorkspaceManagerViewInActivityBarShow,
    );
}
