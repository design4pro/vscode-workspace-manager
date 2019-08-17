import * as vscode from 'vscode';
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

        vscode.commands.executeCommand(ViewsCommands.ActiveBarRefresh);
        vscode.commands.executeCommand(ViewsCommands.ExplorerRefresh);

        return;
    }
}
