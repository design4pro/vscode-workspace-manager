'use strict';

import { getWorkspaceEntries } from '../getWorkspaceEntries';
import { commands } from 'vscode';

export async function setWorkspaceManagerEmpty() {
    const workspaceEntries = await getWorkspaceEntries();

    const isEmpty = !workspaceEntries || !!!workspaceEntries.length;

    commands.executeCommand('setContext', 'workspaceManagerEmpty', isEmpty);
}
