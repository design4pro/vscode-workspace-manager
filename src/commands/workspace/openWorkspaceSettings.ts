import { AbstractCommand, CommandContext } from '../abstractCommand';
import { Command, Commands } from '../common';
import * as vscode from 'vscode';

@Command()
export class OpenWorkspaceSettings extends AbstractCommand {
    constructor() {
        super(Commands.OpenWorkspaceSettings);
    }

    async execute(context?: CommandContext, args?: any) {
        args = { ...args };

        if (args && args.workspaceEntry) {
            const uri = vscode.Uri.file(args.workspaceEntry.path);

            vscode.commands.executeCommand('vscode.open', uri).then(
                value => ({}), // done
                value =>
                    vscode.window.showErrorMessage(
                        'Could not open the workspace settings!'
                    )
            );
        }
    }
}
