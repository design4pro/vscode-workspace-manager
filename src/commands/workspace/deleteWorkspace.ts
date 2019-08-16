'use strict';

// import * as nls from 'vscode-nls';
import { getWorkspaceEntries } from '../../util/getWorkspaceEntries';
import { window, QuickPickItem, QuickPickOptions } from 'vscode';
import { deleteWorkspace } from '../../util/deleteWorkspace';
import { Command, Commands } from '../common';
import { AbstractCommand } from '../abstractCommand';
import { WorkspaceEntry } from '../../model/workspace';

// const localize = nls.loadMessageBundle();

@Command()
export class DeleteWorkspaceCommand extends AbstractCommand {
    constructor() {
        super(Commands.DeleteWorkspace);
    }

    async execute() {
        let workspaceEntries = await getWorkspaceEntries();

        if (!workspaceEntries || !workspaceEntries.length) {
            // const noWorkspacesFoundText = localize(
            //     'noWorkspacesFound.text',
            //     'No workspaces entries found'
            // );

            window.showInformationMessage('No workspaces entries found');

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
