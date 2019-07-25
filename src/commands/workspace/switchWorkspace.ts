'use strict';

import { commands, QuickPickItem, QuickPickOptions, window } from 'vscode';
import * as nls from 'vscode-nls';
import { WorkspaceEntry } from '../../model/workspace';
import { getWorkspaceEntries } from '../../util/getWorkspaceEntries';
import { AbstractCommand } from '../abstractCommand';
import { Command, Commands } from '../common';
import { ISwitchToWorkspaceCommandArgs } from './switchToWorkspace';

const localize = nls.loadMessageBundle();

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
            const noWorkspacesFoundText = localize(
                'noWorkspacesFound.text',
                'No workspaces entries found'
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
            placeHolder: `Choose a workspace to switch to${
                args.inNewWindow ? ' in a new window' : ''
            }...`
        };

        window.showQuickPick(workspaceItems, options).then(
            (workspaceItem?: QuickPickItem) => {
                if (!workspaceItem) {
                    return;
                }

                const entry: WorkspaceEntry = workspaceEntries.find(
                    entry => entry.path === workspaceItem.description
                );

                if (!entry) {
                    return;
                }

                const commandArgs: ISwitchToWorkspaceCommandArgs = {
                    workspaceEntry: entry,
                    inNewWindow: args.inNewWindow
                };

                commands.executeCommand(Commands.SwitchToWorkspace, [
                    commandArgs
                ]);
            },
            (reason: any) => {}
        );
    }
}
