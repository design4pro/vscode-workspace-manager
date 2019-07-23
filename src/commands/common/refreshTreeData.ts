'use strict';

import { Command, Commands } from '../common';
import { AbstractCommand } from '../abstractCommand';
import { cacheWorkspace } from '../../cache/cacheWorkspace';
import { ViewsCommands } from '../../views/common';
import { commands } from 'vscode';

@Command()
export class RefreshTreeData extends AbstractCommand {
    protected trackSuccess = true;

    constructor() {
        super(Commands.RefreshTreeData);
    }

    async execute() {
        await cacheWorkspace();

        commands.executeCommand(ViewsCommands.ActiveBarRefresh);
        commands.executeCommand(ViewsCommands.ExplorerRefresh);

        return;
    }
}
