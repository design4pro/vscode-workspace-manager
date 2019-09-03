import * as vscode from 'vscode';
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

        vscode.commands.executeCommand(Commands.SwitchWorkspace, args);
    }
}
