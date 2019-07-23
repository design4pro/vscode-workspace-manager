'use strict';

import { unlinkSync } from 'fs';
import { window, commands } from 'vscode';
import { WorkspaceEntry } from '../model/workspace';
import { Commands } from '../commands/common';

export function deleteWorkspace(
    workspaceEntry: WorkspaceEntry,
    prompt: boolean
) {
    if (prompt) {
        window
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

                    commands.executeCommand(Commands.RefreshTreeData);
                },
                (reason: any) => {}
            );
    } else {
        unlinkSync(workspaceEntry.path);
    }
}
