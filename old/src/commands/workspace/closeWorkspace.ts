import * as vscode from 'vscode';
import { BuiltInCommands } from '../../constants';
import { AbstractCommand } from '../abstractCommand';
import { Command, Commands } from '../common';

@Command()
export class CloseWorkspaceCommand extends AbstractCommand {
    constructor() {
        super(Commands.CloseWorkspace);
    }

    async execute() {
        await vscode.commands.executeCommand(BuiltInCommands.CloseFolder);
    }
}
