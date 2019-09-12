import * as vscode from 'vscode';
import { cacheWorkspace } from './cache/cacheWorkspace';
import { IConfig } from './config';
import { configuration, ConfigurationWillChangeEvent } from './configuration';
import { CommandContext, setCommandContext } from './constants';
import { statusBarCache } from './util/statusBar/cache';
import { statusBarWorkspace } from './util/statusBar/workspace';
import { GroupsView } from './views/groupsView';
import { ViewCommands } from './views/viewCommands';
import { WorkspacesView } from './views/workspacesView';

const isDebuggingRegex = /^--(debug|inspect)\b(-brk\b|(?!-))=?/;

export class Container {
    static initialize(
        context: vscode.ExtensionContext,
        config: IConfig,
        version: string
    ) {
        this._context = context;
        this._config = config;
        this._version = version;

        context.subscriptions.push(
            (this._workspacesView = new WorkspacesView())
        );
        context.subscriptions.push((this._groupsView = new GroupsView()));

        context.subscriptions.push(
            configuration.onWillChange(this.onConfigurationChanging, this)
        );
    }

    private static onConfigurationChanging(e: ConfigurationWillChangeEvent) {
        this._config = undefined;

        if (
            configuration.changed(
                e.change,
                configuration.name('includeGlobPattern').value
            )
        ) {
            cacheWorkspace();
        }

        if (
            configuration.changed(
                e.change,
                configuration.name('views')('showInActivityBar').value
            )
        ) {
            setCommandContext(
                CommandContext.ViewsWorkspacesInActivityBar,
                Container.config.views.showInActivityBar
            );
        }

        if (
            configuration.changed(
                e.change,
                configuration.name('views')('showInExplorer').value
            )
        ) {
            setCommandContext(
                CommandContext.ViewInExplorerShow,
                Container.config.views.showInExplorer
            );
        }

        if (
            configuration.changed(
                e.change,
                configuration.name('views')(
                    'showWorkspaceRefreshIconInStatusBar'
                ).value
            )
        ) {
            statusBarCache.toggle();
        }

        if (
            configuration.changed(
                e.change,
                configuration.name('views')('showWorkspaceNameInStatusBar')
                    .value
            )
        ) {
            statusBarWorkspace.toggle();
        }
    }

    static get machineId() {
        return vscode.env.machineId;
    }

    private static _isDebugging: boolean | undefined;
    public static get isDebugging() {
        if (this._isDebugging === undefined) {
            try {
                const args = process.execArgv;

                this._isDebugging = args
                    ? args.some(arg => isDebuggingRegex.test(arg))
                    : false;
            } catch {}
        }

        return this._isDebugging;
    }

    private static _uriHandler: vscode.UriHandler;
    static get uriHandler() {
        return this._uriHandler;
    }

    private static _version: string;
    static get version() {
        return this._version;
    }

    private static _config: IConfig | undefined;
    static get config() {
        if (this._config === undefined) {
            this._config = configuration.get<IConfig>();
        }

        return this._config;
    }

    private static _context: vscode.ExtensionContext;
    static get context() {
        return this._context;
    }

    static resetConfig() {
        this._config = undefined;
    }

    private static _workspacesView: WorkspacesView | undefined;
    static get workspacesView(): WorkspacesView {
        if (this._workspacesView === undefined) {
            this._context.subscriptions.push(
                (this._workspacesView = new WorkspacesView())
            );
        }

        return this._workspacesView;
    }

    private static _groupsView: GroupsView | undefined;
    static get groupsView(): GroupsView {
        if (this._groupsView === undefined) {
            this._context.subscriptions.push(
                (this._groupsView = new GroupsView())
            );
        }

        return this._groupsView;
    }

    private static _viewCommands: ViewCommands | undefined;
    static get viewCommands() {
        if (this._viewCommands === undefined) {
            this._viewCommands = new ViewCommands();
        }
        return this._viewCommands;
    }
}
