'use strict';

import { commands, QuickPickItem, QuickPickOptions, window } from 'vscode';
import * as nls from 'vscode-nls';
import { WorkspaceEntry } from '../../model/workspace';
import { getWorkspaceEntries } from '../../util/getWorkspaceEntries';
import { AbstractCommand } from '../abstractCommand';
import { Command, Commands } from '../common';
import { ISwitchToWorkspaceCommandArgs } from './switchToWorkspace';
import { ISwitchWorkspaceCommandArgs } from './switchWorkspace';

const localize = nls.loadMessageBundle();

@Command()
export class SwitchWorkspaceInNewWindowCommand extends AbstractCommand {
    constructor() {
        super(Commands.SwitchWorkspaceInNewWindow);
    }

    async execute(args: ISwitchWorkspaceCommandArgs = { inNewWindow: true }) {
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

                commands.executeCommand(
                    Commands.SwitchToWorkspace,
                    commandArgs
                );
            },
            (reason: any) => {}
        );
    }
}
