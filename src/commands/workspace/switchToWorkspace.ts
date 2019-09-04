import { exec } from 'child_process';
import { IWorkspaceCommandArgs } from '../../model/workspace';
import { getApp } from '../../util/getApp';
import { onCommandRun } from '../../util/onCommandRun';
import { AbstractCommand, CommandContext } from '../abstractCommand';
import { Command, Commands } from '../common';

@Command()
export class SwitchToWorkspaceCommand extends AbstractCommand {
    constructor() {
        super(Commands.SwitchToWorkspace);
    }

    async execute(context?: CommandContext, args: IWorkspaceCommandArgs = {}) {
        args = { ...args };

        const app = getApp();
        const command = `${app} ${args.inNewWindow ? '-n' : '-r'} "${
            args.workspaceEntry!.path
        }"`;

        exec(command, onCommandRun);
    }
}
