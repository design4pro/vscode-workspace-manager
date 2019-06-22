import { unlinkSync } from 'fs';
import * as vscode from 'vscode';
import { WorkspaceEntry } from '../model/workspaceEntry';
import { refreshTreeDataCommand } from '../commands';

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

                    unlinkSync(workspaceEntry.path);

                    refreshTreeDataCommand();
                },
                (reason: any) => {}
            );
    } else {
        unlinkSync(workspaceEntry.path);
    }
}
