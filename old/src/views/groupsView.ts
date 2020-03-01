import { commands, ConfigurationChangeEvent } from 'vscode';
import { ITreeViewConfig, IViewConfig } from '../config';
import { configuration } from '../configuration';
import { CommandContext, setCommandContext } from '../constants';
import { Container } from '../container';
import { GroupsNode } from './nodes';
import { ViewBase } from './viewBase';

export class GroupsView extends ViewBase<GroupsNode> {
    constructor() {
        super('workspaceManager.views.groups', 'Groups');
    }

    getRoot() {
        return new GroupsNode(this);
    }

    protected get location(): string | undefined {
        return this.config.location;
    }

    protected registerCommands() {
        void Container.viewCommands;

        commands.registerCommand(
            this.getQualifiedCommand('refresh'),
            () => this.refresh(true),
            this
        );
    }

    protected onConfigurationChanged(e: ConfigurationChangeEvent) {
        if (
            !configuration.changed(
                e,
                configuration.name('views')('groups').value
            ) &&
            !configuration.changed(
                e,
                configuration.name('views')('removeCurrentWorkspaceFromList')
                    .value
            )
        ) {
            return;
        }

        if (
            configuration.changed(
                e,
                configuration.name('views')('groups')('enabled').value
            )
        ) {
            setCommandContext(CommandContext.GroupsViewInActivityBar, true);
        }

        if (
            configuration.changed(
                e,
                configuration.name('views')('groups')('location').value
            )
        ) {
            this.initialize(this.location, { showCollapseAll: true });
        }

        if (
            (!configuration.initializing(e) && this._root !== undefined) ||
            configuration.changed(
                e,
                configuration.name('views')('removeCurrentWorkspaceFromList')
                    .value
            )
        ) {
            void this.refresh(true);
        }
    }

    get config(): IViewConfig & ITreeViewConfig {
        return {
            ...Container.config.views,
            ...Container.config.views.groups
        };
    }
}
