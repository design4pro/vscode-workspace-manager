'use strict';

import { workspace, commands } from 'vscode';

export function setWorkspaceManagerViewInActivityBarShow() {
    const workspaceManagerViewInActivityBarShow = !!workspace
        .getConfiguration('workspaceManager')
        .get('showInActivityBar');

    commands.executeCommand(
        'setContext',
        'workspaceManagerViewInActivityBarShow',
        workspaceManagerViewInActivityBarShow
    );
}
