import * as vscode from 'vscode';
import { Command, Commands } from '../common';
import { AbstractCommand } from '../abstractCommand';

@Command()
export class CloseWorkspaceCommand extends AbstractCommand {
    constructor() {
        super(Commands.CloseWorkspace);
    }

    async execute() {
        await vscode.commands.executeCommand('workbench.action.closeFolder');
    }
}
