import * as vscode from 'vscode';
import { WorkspaceEntry } from '../../model/workspace';
import { deleteWorkspace } from '../../util/deleteWorkspace';
import { getWorkspaceEntries } from '../../util/getWorkspaceEntries';
import { AbstractCommand } from '../abstractCommand';
import { Command, Commands } from '../common';

@Command()
export class DeleteWorkspaceCommand extends AbstractCommand {
    constructor() {
        super(Commands.DeleteWorkspace);
    }

    async execute() {
        let workspaceEntries = await getWorkspaceEntries();

        if (!workspaceEntries || !workspaceEntries.length) {
            vscode.window.showInformationMessage('No workspaces entries found');

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
                if (!workspaceItem || !workspaceEntries) {
                    return;
                }

                const entry: WorkspaceEntry | undefined = workspaceEntries.find(
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
}
