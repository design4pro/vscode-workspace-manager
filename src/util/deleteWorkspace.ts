import * as fs from 'fs';
import * as vscode from 'vscode';
import { Commands } from '../commands/common';
import { Workspace } from '../model/workspace';

export function deleteWorkspace(workspace: Workspace, prompt: boolean) {
    if (prompt) {
        vscode.window
            .showInformationMessage(
                `Are you sure you want to delete file ${workspace.getPath}?`,
                'Yes',
                'No'
            )
            .then(
                (answer?: string) => {
                    if ((answer || '').trim().toLowerCase() !== 'yes') {
                        return;
                    }

                    fs.unlinkSync(workspace.getPath);

                    vscode.commands.executeCommand(Commands.CacheWorkspace);
                },
                (reason: any) => {}
            );
    } else {
        fs.unlinkSync(workspace.getPath);
    }
}
