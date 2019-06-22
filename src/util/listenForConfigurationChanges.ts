'use strict';

import { ConfigurationChangeEvent, Disposable, workspace } from 'vscode';
import { refreshTreeDataCommand } from '../commands/common/refreshTreeData';
import { setWorkspaceManagerEmpty } from './setWorkspaceManagerEmpty';
import { setWorkspaceManagerViewInActivityBarShow } from './setWorkspaceManagerViewInActivityBarShow';
import { setWorkspaceManagerViewInExplorerShow } from './setWorkspaceManagerViewInExplorerShow';

export function listenForConfigurationChanges(): Disposable {
    return workspace.onDidChangeConfiguration(
        (event: ConfigurationChangeEvent) => {
            if (event.affectsConfiguration('workspaceManager.paths')) {
                setWorkspaceManagerEmpty();

                refreshTreeDataCommand();
            } else if (
                event.affectsConfiguration('workspaceManager.showInActivityBar')
            ) {
                setWorkspaceManagerViewInActivityBarShow();
            } else if (
                event.affectsConfiguration('workspaceManager.showInExplorer')
            ) {
                setWorkspaceManagerViewInExplorerShow();
            }
        }
    );
}
