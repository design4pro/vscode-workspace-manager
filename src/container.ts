'use strict';

import { env, ExtensionContext, UriHandler } from 'vscode';
import { configuration, ConfigurationWillChangeEvent } from './configuration';
import { IConfig } from './model/config';
import { CommandContext, setCommandContext } from './constants';
import { cacheWorkspace } from './cache/cacheWorkspace';

const isDebuggingRegex = /^--(debug|inspect)\b(-brk\b|(?!-))=?/;

export class Container {
    static initialize(
        context: ExtensionContext,
        config: IConfig,
        version: string
    ) {
        this._context = context;
        this._config = config;
        this._version = version;

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
                configuration.name('showInActivityBar').value
            )
        ) {
            setCommandContext(
                CommandContext.ViewInActivityBarShow,
                Container.config.showInActivityBar
            );
        }

        if (
            configuration.changed(
                e.change,
                configuration.name('showInExplorer').value
            )
        ) {
            setCommandContext(
                CommandContext.ViewInExplorerShow,
                Container.config.showInExplorer
            );
        }
    }

    static get machineId() {
        return env.machineId;
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

    private static _uriHandler: UriHandler;
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

    private static _context: ExtensionContext;
    static get context() {
        return this._context;
    }

    static resetConfig() {
        this._config = undefined;
    }
}
