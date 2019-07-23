'use strict';

import { exec } from 'child_process';
import { WorkspaceEntry } from '../../model/workspace';
import { getApp } from '../../util/getApp';
import { onCommandRun } from '../../util/onCommandRun';
import { AbstractCommand } from '../abstractCommand';
import { Command, Commands } from '../common';

export interface ISwitchToWorkspaceCommandArgs {
    workspaceEntry?: WorkspaceEntry;
    inNewWindow?: boolean;
}

@Command()
export class SwitchToWorkspaceCommand extends AbstractCommand {
    constructor() {
        super(Commands.SwitchToWorkspace);
    }

    async execute(args: ISwitchToWorkspaceCommandArgs = {}) {
        args = { ...args };

        const app = getApp();
        const command = `${app} ${args.inNewWindow ? '-n' : '-r'} "${
            args.workspaceEntry.path
        }"`;

        exec(command, onCommandRun);
    }
}
