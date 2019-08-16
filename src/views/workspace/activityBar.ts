'use strict';

import { commands } from 'vscode';
import { configuration } from '../../configuration';
import { CommandContext, setCommandContext } from '../../constants';
import { TreeDataProvider } from '../../util/explorer/treeDataProvider';
import { AbstractView } from '../abstractView';
import { View, Views, ViewsCommands } from '../common';

@View()
export class ActiveBar extends AbstractView {
    constructor() {
        super(Views.ActiveBar);

        setCommandContext(CommandContext.ViewInActivityBarShow, this.canShow);
    }

    protected registerCommands() {
        commands.registerCommand(ViewsCommands.ActiveBarRefresh, () =>
            this.refresh()
        );
    }

    execute(): TreeDataProvider {
        return new TreeDataProvider();
    }

    get canShow(): boolean {
        return configuration.get<boolean>(
            configuration.name('showInActivityBar').value,
            null,
            true
        );
    }
}
