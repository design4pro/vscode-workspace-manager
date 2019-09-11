import * as vscode from 'vscode';
import { IWorkspaceCommandArgs, Workspace } from '../../model/workspace';
import { getWorkspaces } from '../../util/getWorkspaces';
import { AbstractCommand, CommandContext } from '../abstractCommand';
import { Command, Commands } from '../common';

@Command()
export class SwitchWorkspaceCommand extends AbstractCommand {
    constructor() {
        super(Commands.SwitchWorkspace);
    }

    async execute(context?: CommandContext, args: IWorkspaceCommandArgs = {}) {
        args = { ...args };

        const workspaces = await getWorkspaces();

        if (!workspaces || !workspaces.length) {
            vscode.window.showInformationMessage('No workspaces entries found');

            return;
        }

        if (args.workspace && args.workspace.getPath()) {
            const entry: Workspace | undefined = workspaces.find(
                entry => entry.getPath() === args.workspace!.getPath()
            );

            if (!entry) {
                return;
            }

            const commandArgs: IWorkspaceCommandArgs = {
                workspace: entry,
                inNewWindow: args.inNewWindow
            };

            vscode.commands.executeCommand(
                Commands.SwitchToWorkspace,
                commandArgs
            );
        } else {
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
                placeHolder: `Choose a workspace to switch to${
                    args.inNewWindow ? ' in a new window' : ''
                }...`
            };

            vscode.window.showQuickPick(workspaceItems, options).then(
                (workspaceItem?: vscode.QuickPickItem) => {
                    if (!workspaceItem) {
                        return;
                    }

                    const entry: Workspace | undefined = workspaces.find(
                        entry => entry.getPath() === workspaceItem.description
                    );

                    if (!entry) {
                        return;
                    }

                    const commandArgs: IWorkspaceCommandArgs = {
                        workspace: entry,
                        inNewWindow: args.inNewWindow
                    };

                    vscode.commands.executeCommand(
                        Commands.SwitchToWorkspace,
                        commandArgs
                    );
                },
                (reason: any) => {}
            );
        }
    }
}
