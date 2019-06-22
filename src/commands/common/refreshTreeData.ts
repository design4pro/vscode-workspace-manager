import * as vscode from 'vscode';

export function refreshTreeDataCommand() {
    vscode.commands.executeCommand('vscodeWorkspaceManager.treeData.refresh');
}
