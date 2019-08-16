'use strict';

import { commands } from 'vscode';
import { cacheWorkspace } from '../../cache/cacheWorkspace';
import { ViewsCommands } from '../../views/common';
import { AbstractCommand } from '../abstractCommand';
import { Command, Commands } from '../common';

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
