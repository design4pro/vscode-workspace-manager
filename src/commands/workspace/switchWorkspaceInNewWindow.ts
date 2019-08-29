import * as vscode from 'vscode';
import { WorkspaceEntry } from '../../model/workspace';
import { getWorkspaceEntries } from '../../util/getWorkspaceEntries';
import { AbstractCommand, CommandContext } from '../abstractCommand';
import { Command, Commands } from '../common';
import { ISwitchToWorkspaceCommandArgs } from './switchToWorkspace';

@Command()
export class SwitchWorkspaceInNewWindowCommand extends AbstractCommand {
    constructor() {
        super(Commands.SwitchWorkspaceInNewWindow);
    }

    async execute(
        context?: CommandContext,
        args: ISwitchToWorkspaceCommandArgs = { inNewWindow: true }
    ) {
        args = { ...args };

        if (
            context &&
            context.command === Commands.SwitchWorkspaceInNewWindow
        ) {
            args.inNewWindow = true;
        }

        const workspaceEntries = await getWorkspaceEntries();

        if (!workspaceEntries || !workspaceEntries.length) {
            vscode.window.showInformationMessage('No workspaces entries found');

            return;
        }

        if (args.workspaceEntry && args.workspaceEntry.path) {
            const entry: WorkspaceEntry | undefined = workspaceEntries.find(
                entry => entry.path === args.workspaceEntry!.path
            );

            if (!entry) {
                return;
            }

            const commandArgs: ISwitchToWorkspaceCommandArgs = {
                workspaceEntry: entry,
                inNewWindow: args.inNewWindow
            };

            vscode.commands.executeCommand(
                Commands.SwitchToWorkspace,
                commandArgs
            );
        } else {
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
                    args.inNewWindow ? ' in a new window' : ''
                }...`
            };

            vscode.window.showQuickPick(workspaceItems, options).then(
                (workspaceItem?: vscode.QuickPickItem) => {
                    if (!workspaceItem) {
                        return;
                    }

                    const entry:
                        | WorkspaceEntry
                        | undefined = workspaceEntries.find(
                        entry => entry.path === workspaceItem.description
                    );

                    if (!entry) {
                        return;
                    }

                    const commandArgs: ISwitchToWorkspaceCommandArgs = {
                        workspaceEntry: entry,
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
