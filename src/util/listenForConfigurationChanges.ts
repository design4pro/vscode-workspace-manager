import * as vscode from 'vscode';
import { setVSCodeWorkspaceManagerEmpty } from './setVSCodeWorkspaceManagerEmpty';
import { setVSCodeWorkspaceManagerViewInActivityBarShow } from './setVSCodeWorkspaceManagerViewInActivityBarShow';
import { setVSCodeWorkspaceManagerViewInExplorerShow } from './setVSCodeWorkspaceManagerViewInExplorerShow';
import { refreshTreeDataCommand } from '../commands/common/refreshTreeData';

export function listenForConfigurationChanges(): vscode.Disposable {
    return vscode.workspace.onDidChangeConfiguration(
        (event: vscode.ConfigurationChangeEvent) => {
            if (event.affectsConfiguration('vscodeWorkspaceManager.paths')) {
                setVSCodeWorkspaceManagerEmpty();

                refreshTreeDataCommand();
            } else if (
                event.affectsConfiguration(
                    'vscodeWorkspaceManager.showInActivityBar'
                )
            ) {
                setVSCodeWorkspaceManagerViewInActivityBarShow();
            } else if (
                event.affectsConfiguration(
                    'vscodeWorkspaceManager.showInExplorer'
                )
            ) {
                setVSCodeWorkspaceManagerViewInExplorerShow();
            }
        }
    );
}
