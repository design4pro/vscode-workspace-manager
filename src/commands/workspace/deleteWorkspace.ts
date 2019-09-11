import * as vscode from 'vscode';
import { WorkspaceEntry, Workspace } from '../../model/workspace';
import { deleteWorkspace } from '../../util/deleteWorkspace';
import { getWorkspaces } from '../../util/getWorkspaces';
import { AbstractCommand } from '../abstractCommand';
import { Command, Commands } from '../common';

@Command()
export class DeleteWorkspaceCommand extends AbstractCommand {
    constructor() {
        super(Commands.DeleteWorkspace);
    }

    async execute() {
        const workspaces = await getWorkspaces();

        if (!workspaces || !workspaces.length) {
            vscode.window.showInformationMessage('No workspaces entries found');

            return;
        }

        const workspaceItems = workspaces.map(
            entry =>
                <vscode.QuickPickItem>{
                    label: entry.getName(),
                    description: entry.getPath()
                }
        );

        const options = <vscode.QuickPickOptions>{
            matchOnDescription: false,
            matchOnDetail: false,
            placeHolder: `Choose a workspace to delete...`
        };

        vscode.window.showQuickPick(workspaceItems, options).then(
            (workspaceItem?: vscode.QuickPickItem) => {
                if (!workspaceItem || !workspaces) {
                    return;
                }

                const entry: Workspace | undefined = workspaces.find(
                    entry => entry.getPath() === workspaceItem.description
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
