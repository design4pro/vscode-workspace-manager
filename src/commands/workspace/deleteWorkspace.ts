import { deleteWorkspace, gatherWorkspaceEntries } from '../../util';
import * as vscode from 'vscode';
import * as nls from 'vscode-nls';

const localize = nls.loadMessageBundle();

export function deleteWorkspaceCommand() {
    let workspaceEntries = gatherWorkspaceEntries();

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
        placeHolder: `Choose a workspace to delete...`
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

            deleteWorkspace(entry, true);
        },
        (reason: any) => {}
    );
}
