import * as vscode from 'vscode';
import { gatherWorkspaceEntries } from './getWorkspaceEntries';

export function setVSCodeWorkspaceManagerEmpty() {
    const vscodeWorkspaceManagerEmpty = !!!gatherWorkspaceEntries().length;

    vscode.commands.executeCommand(
        'setContext',
        'vscodeWorkspaceManagerEmpty',
        vscodeWorkspaceManagerEmpty
    );
}
