'use strict';

import { commands } from 'vscode';
import { configuration } from '../../configuration';
import { CommandContext, setCommandContext } from '../../constants';
import { TreeDataProvider } from '../../util/explorer/treeDataProvider';
import { AbstractView } from '../abstractView';
import { View, Views, ViewsCommands } from '../common';

@View()
export class Explorer extends AbstractView {
    constructor() {
        super(Views.Explorer);

        setCommandContext(CommandContext.ViewInExplorerShow, this.canShow);
    }

    protected registerCommands() {
        commands.registerCommand(ViewsCommands.ExplorerRefresh, () =>
            this.refresh()
        );
    }

    execute(): TreeDataProvider {
        return new TreeDataProvider();
    }

    get canShow(): boolean {
        return configuration.get<boolean>(
            configuration.name('showInExplorer').value,
            null,
            true
        );
    }
}
