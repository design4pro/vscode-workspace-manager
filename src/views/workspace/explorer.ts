import * as vscode from 'vscode';
import { configuration } from '../../configuration';
import { CommandContext, setCommandContext } from '../../constants';
import { TreeDataProvider } from '../../util/explorer/treeDataProvider';
import { AbstractView } from '../abstractView';
import { View, Views, ViewsCommands } from '../common';

@View()
export class Explorer extends AbstractView {
    constructor(treeData: TreeDataProvider) {
        super(Views.Explorer, treeData);

        setCommandContext(CommandContext.ViewInExplorerShow, this.canShow);
    }

    protected registerCommands() {
        vscode.commands.registerCommand(ViewsCommands.ExplorerRefresh, () =>
            this.refresh()
        );
    }
    get canShow(): boolean {
        return configuration.get<boolean>(
            configuration.name('showInExplorer').value,
            null,
            true
        );
    }
}
