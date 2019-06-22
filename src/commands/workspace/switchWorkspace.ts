import * as nls from 'vscode-nls';
import { switchToWorkspaceCommand } from './switchToWorkspace';
import { gatherWorkspaceEntries } from '../../util/getWorkspaceEntries';
import { AbstractCommand } from '../abstractCommand';
import { window, QuickPickItem, QuickPickOptions } from 'vscode';
import { Commands, Command } from '../common';

const localize = nls.loadMessageBundle();

@Command()
export class SwitchWorkspaceCommand extends AbstractCommand {
    constructor() {
        console.log(Commands.SwitchWorkspace);
        super(Commands.SwitchWorkspace);
    }

    execute(inNewWindow?: boolean) {
        const workspaceEntries = gatherWorkspaceEntries();

        console.log(workspaceEntries);

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
            placeHolder: `Choose a workspace to switch to${
                inNewWindow ? ' in a new window' : ''
            }...`
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

                switchToWorkspaceCommand(entry, inNewWindow);
            },
            (reason: any) => {}
        );
    }
}
