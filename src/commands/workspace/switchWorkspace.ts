import * as vscode from 'vscode';
import { WorkspaceEntry } from '../../model/workspace';
import { getWorkspaceEntries } from '../../util/getWorkspaceEntries';
import { AbstractCommand } from '../abstractCommand';
import { Command, Commands } from '../common';
import { ISwitchToWorkspaceCommandArgs } from './switchToWorkspace';

export interface ISwitchWorkspaceCommandArgs {
    inNewWindow?: boolean;
}

@Command()
export class SwitchWorkspaceCommand extends AbstractCommand {
    constructor() {
        super(Commands.SwitchWorkspace);
    }

    async execute(args: ISwitchWorkspaceCommandArgs = {}) {
        args = { ...args };

        const workspaceEntries = await getWorkspaceEntries();

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
            placeHolder: `Choose a workspace to switch to${
                args.inNewWindow ? ' in a new window' : ''
            }...`
        };

        vscode.window.showQuickPick(workspaceItems, options).then(
            (workspaceItem?: vscode.QuickPickItem) => {
                if (!workspaceItem) {
                    return;
                }

                const entry: WorkspaceEntry | undefined = workspaceEntries.find(
                    entry => entry.path === workspaceItem.description
                );

                if (!entry) {
                    return;
                }

                const commandArgs: ISwitchToWorkspaceCommandArgs = {
                    workspaceEntry: entry,
                    inNewWindow: args.inNewWindow
                };

                vscode.commands.executeCommand(Commands.SwitchToWorkspace, [
                    commandArgs
                ]);
            },
            (reason: any) => {}
        );
    }
}
