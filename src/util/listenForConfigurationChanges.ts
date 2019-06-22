'use strict';

import { ConfigurationChangeEvent, Disposable, workspace } from 'vscode';
import { refreshTreeDataCommand } from '../commands/common/refreshTreeData';
import { setWorkspaceManagerEmpty } from './context/setWorkspaceManagerEmpty';
import { setWorkspaceManagerViewInActivityBarShow } from './context/setWorkspaceManagerViewInActivityBarShow';
import { setWorkspaceManagerViewInExplorerShow } from './context/setWorkspaceManagerViewInExplorerShow';

export function listenForConfigurationChanges(): Disposable {
    return workspace.onDidChangeConfiguration(
        (event: ConfigurationChangeEvent) => {
            if (
                event.affectsConfiguration(
                    'workspaceManager.includeGlobPattern'
                ) ||
                event.affectsConfiguration(
                    'workspaceManager.excludeGlobPattern'
                )
            ) {
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
