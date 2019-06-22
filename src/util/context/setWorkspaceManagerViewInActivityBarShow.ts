'use strict';

import { workspace, commands } from 'vscode';

export function setWorkspaceManagerViewInActivityBarShow() {
    const workspaceManagerViewInActivityBarShow = !!workspace
        .getConfiguration('workspace-manager')
        .get('showInActivityBar');

    commands.executeCommand(
        'setContext',
        'workspaceManagerViewInActivityBarShow',
        workspaceManagerViewInActivityBarShow
    );
}
