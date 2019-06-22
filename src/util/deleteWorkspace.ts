'use strict';

import { unlinkSync } from 'fs';
import { window } from 'vscode';
import { refreshTreeDataCommand } from '../commands/common/refreshTreeData';
import { WorkspaceEntry } from '../model/workspace';

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

                    refreshTreeDataCommand();
                },
                (reason: any) => {}
            );
    } else {
        unlinkSync(workspaceEntry.path);
    }
}
