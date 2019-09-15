import { commands, ConfigurationChangeEvent } from 'vscode';
import { ITreeViewConfig, IViewConfig } from '../config';
import { configuration } from '../configuration';
import { CommandContext, setCommandContext } from '../constants';
import { Container } from '../container';
import { FavoritesNode } from './nodes/favoritesNode';
import { ViewBase } from './viewBase';

export class FavoritesView extends ViewBase<FavoritesNode> {
    constructor() {
        super('workspaceManager.views.favorites', 'Favorites');
    }

    getRoot() {
        return new FavoritesNode(this);
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
                configuration.name('views')('favorites').value
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
                configuration.name('views')('favorites')('enabled').value
            )
        ) {
            setCommandContext(CommandContext.FavoritesViewInActivityBar, true);
        }

        if (
            configuration.changed(
                e,
                configuration.name('views')('favorites')('location').value
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
            ...Container.config.views.favorites
        };
    }
}
