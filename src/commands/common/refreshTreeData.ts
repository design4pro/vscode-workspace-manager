'use strict';

import { commands } from 'vscode';

export function refreshTreeDataCommand() {
    commands.executeCommand('workspaceManager.treeData.refresh');
}
