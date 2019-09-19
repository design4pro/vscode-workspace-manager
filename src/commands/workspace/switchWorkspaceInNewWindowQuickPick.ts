import * as vscode from 'vscode';
import { IWorkspaceCommandArgs } from '../../model/workspace';
import { AbstractCommand, CommandContext } from '../abstractCommand';
import { Command, Commands } from '../common';

@Command()
export class SwitchWorkspaceInNewWindowQuickPickCommand extends AbstractCommand {
    constructor() {
        super(Commands.SwitchWorkspaceInNewWindowQuickPick);
    }

    async execute(
        context?: CommandContext,
        args: IWorkspaceCommandArgs = { inNewWindow: true }
    ) {
        args = { ...args };

        args.inNewWindow = true;

        vscode.commands.executeCommand(Commands.SwitchWorkspaceQuickPick, args);
    }
}
