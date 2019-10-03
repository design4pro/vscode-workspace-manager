import * as vscode from 'vscode';
import { Workspace, IWorkspaceCommandArgs } from '../../model/workspace';
import { deleteWorkspace } from '../../util/deleteWorkspace';
import { getWorkspaces } from '../../util/getWorkspaces';
import { AbstractCommand, CommandContext } from '../abstractCommand';
import { Command, Commands } from '../common';

@Command()
export class DeleteWorkspaceQuickPickCommand extends AbstractCommand {
    constructor() {
        super(Commands.DeleteWorkspaceQuickPick);
    }

    async execute(context?: CommandContext, args: IWorkspaceCommandArgs = {}) {
        const workspaces = await getWorkspaces();

        console.log(args);

        if (!workspaces || !workspaces.length) {
            vscode.window.showInformationMessage('No workspaces entries found');

            return;
        }

        if (args.workspace && args.workspace.path) {
            const entry: Workspace | undefined = workspaces.find(
                entry => entry.path === args.workspace!.path
            );

            if (!entry) {
                return;
            }

            deleteWorkspace(entry, true);
        } else {
            const workspaceItems = workspaces.map(
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
                    if (!workspaceItem || !workspaces) {
                        return;
                    }

                    const entry: Workspace | undefined = workspaces.find(
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
}
