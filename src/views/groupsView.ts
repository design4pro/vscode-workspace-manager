import { commands, ConfigurationChangeEvent } from 'vscode';
import { configuration } from '../configuration';
import { Container } from '../container';
import { ITreeViewConfig, IViewConfig } from '../model/config';
import { GroupsNode } from './nodes';
import { ViewBase } from './viewBase';

export class GroupsView extends ViewBase<GroupsNode> {
    constructor() {
        super('workspaceManager.views.groups', 'Groups');
    }

    getRoot() {
        return new GroupsNode(this);
    }

    protected get location(): string {
        return `workspaceManager`;
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
            )
        ) {
            return;
        }

        if (
            configuration.changed(
                e,
                configuration.name('views')('groups').value
            )
        ) {
            this.initialize(this.location, { showCollapseAll: true });
        }

        if (!configuration.initializing(e) && this._root !== undefined) {
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
