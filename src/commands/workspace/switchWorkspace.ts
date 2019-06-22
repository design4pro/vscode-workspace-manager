import * as nls from 'vscode-nls';
import { gatherWorkspaceEntries } from '../../util';
import { switchToWorkspaceCommand } from './switchToWorkspace';
import * as vscode from 'vscode';

const localize = nls.loadMessageBundle();

export function switchWorkspaceCommand(inNewWindow: boolean = false) {
    const workspaceEntries = gatherWorkspaceEntries();

    if (!workspaceEntries.length) {
        const noWorkspacesFoundText = localize(
            'noWorkspacesFound.text',
            'No workspaces found'
        );

        vscode.window.showInformationMessage(noWorkspacesFoundText);

        return;
    }

    const workspaceItems = workspaceEntries.map(
        entry =>
            <vscode.QuickPickItem>{
                label: entry.name,
                description: entry.path
            }
    );

    const options = <vscode.QuickPickOptions>{
        matchOnDescription: false,
        matchOnDetail: false,
        placeHolder: `Choose a workspace to switch to${
            inNewWindow ? ' in a new window' : ''
        }...`
    };

    vscode.window.showQuickPick(workspaceItems, options).then(
        (workspaceItem?: vscode.QuickPickItem) => {
            if (!workspaceItem) {
                return;
            }

            const entry = workspaceEntries.find(
                entry => entry.path === workspaceItem.description
            );

            if (!entry) {
                return;
            }

            switchToWorkspaceCommand(entry, inNewWindow);
        },
        (reason: any) => {}
    );
}
