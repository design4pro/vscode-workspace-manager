import * as nls from 'vscode-nls';
import { gatherWorkspaceEntries } from '../../util/getWorkspaceEntries';
import { window, QuickPickItem, QuickPickOptions } from 'vscode';
import { deleteWorkspace } from '../../util/deleteWorkspace';

const localize = nls.loadMessageBundle();

export function deleteWorkspaceCommand() {
    let workspaceEntries = gatherWorkspaceEntries();

    if (!workspaceEntries.length) {
        const noWorkspacesFoundText = localize(
            'noWorkspacesFound.text',
            'No workspaces found'
        );

        window.showInformationMessage(noWorkspacesFoundText);

        return;
    }

    const workspaceItems = workspaceEntries.map(
        entry =>
            <QuickPickItem>{
                label: entry.name,
                description: entry.path
            }
    );

    const options = <QuickPickOptions>{
        matchOnDescription: false,
        matchOnDetail: false,
        placeHolder: `Choose a workspace to delete...`
    };

    window.showQuickPick(workspaceItems, options).then(
        (workspaceItem?: QuickPickItem) => {
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
