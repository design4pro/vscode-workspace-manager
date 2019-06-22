'use strict';

import { gatherWorkspaceEntries } from './getWorkspaceEntries';
import { commands } from 'vscode';

export async function setWorkspaceManagerEmpty() {
    const workspaceManagerEmpty = await gatherWorkspaceEntries();

    commands.executeCommand(
        'setContext',
        'workspaceManagerEmpty',
        !!!workspaceManagerEmpty.length
    );
}
