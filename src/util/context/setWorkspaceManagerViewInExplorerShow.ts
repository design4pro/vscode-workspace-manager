'use strict';

import { workspace, commands } from 'vscode';

export function setWorkspaceManagerViewInExplorerShow() {
    const workspaceManagerViewInExplorerShow = !!workspace
        .getConfiguration('workspace-manager')
        .get('showInExplorer');

    commands.executeCommand(
        'setContext',
        'workspaceManagerViewInExplorerShow',
        workspaceManagerViewInExplorerShow
    );
}
