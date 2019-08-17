import * as fs from 'fs';
import * as vscode from 'vscode';
import { WorkspaceEntry } from '../model/workspace';
import { Commands } from '../commands/common';

export function deleteWorkspace(
    workspaceEntry: WorkspaceEntry,
    prompt: boolean
) {
    if (prompt) {
        vscode.window
            .showInformationMessage(
                `Are you sure you want to delete file ${workspaceEntry.path}?`,
                'Yes',
                'No'
            )
            .then(
                (answer?: string) => {
                    if ((answer || '').trim().toLowerCase() !== 'yes') {
                        return;
                    }

                    fs.unlinkSync(workspaceEntry.path);

                    vscode.commands.executeCommand(Commands.RefreshTreeData);
                },
                (reason: any) => {}
            );
    } else {
        fs.unlinkSync(workspaceEntry.path);
    }
}
