import { commands, ConfigurationChangeEvent } from 'vscode';
import { ITreeViewConfig, IViewConfig } from '../config';
import { configuration } from '../configuration';
import { Container } from '../container';
import { WorkspacesNode } from './nodes/workspacesNode';
import { ViewBase } from './viewBase';

export class WorkspacesView extends ViewBase<WorkspacesNode> {
    constructor() {
        super('workspaceManager.views.workspaces', 'Workspaces');
    }

    getRoot() {
        return new WorkspacesNode(this);
    }

    protected get location(): string | undefined {
        return this.config.location;
    }

    protected registerCommands() {
        void Container.viewCommands;

        console.log('WorkspacesView', this.getQualifiedCommand('refresh'));

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
                configuration.name('views')('workspaces').value
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
                configuration.name('views')('workspaces')('location').value
            )
        ) {
            this.initialize(this.location);
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
            ...Container.config.views.workspaces
        };
    }
}
