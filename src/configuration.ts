import { readFileSync, writeFileSync } from 'fs';
import * as VError from 'verror';
import * as vscode from 'vscode';
import { IConfig } from './config';
import { extensionId } from './constants';
import { Container } from './container';
import { Functions } from './system/function';
import { getWorkspaceByRootPath } from './util/getWorkspaceByRootPath';
import { addToValueTree, getConfigurationValue, parse } from './util/json';

const emptyConfig: IConfig = new Proxy<IConfig>({} as IConfig, {
    get: function() {
        return emptyConfig;
    }
});

export interface ConfigurationWillChangeEvent {
    change: vscode.ConfigurationChangeEvent;
    transform?(
        e: vscode.ConfigurationChangeEvent
    ): vscode.ConfigurationChangeEvent;
}

export class Configuration extends vscode.Disposable {
    constructor() {
        super(() => this.dispose());
    }

    dispose() {
        this._onDidChange.dispose();
    }

    static configure(context: vscode.ExtensionContext) {
        context.subscriptions.push(
            vscode.workspace.onDidChangeConfiguration(
                configuration.onConfigurationChanged,
                configuration
            )
        );
    }

    private _onDidChange = new vscode.EventEmitter<
        vscode.ConfigurationChangeEvent
    >();
    get onDidChange(): vscode.Event<vscode.ConfigurationChangeEvent> {
        return this._onDidChange.event;
    }

    private _onDidChangeAny = new vscode.EventEmitter<
        vscode.ConfigurationChangeEvent
    >();
    get onDidChangeAny(): vscode.Event<vscode.ConfigurationChangeEvent> {
        return this._onDidChange.event;
    }

    private _onWillChange = new vscode.EventEmitter<
        ConfigurationWillChangeEvent
    >();
    get onWillChange(): vscode.Event<ConfigurationWillChangeEvent> {
        return this._onWillChange.event;
    }

    private onConfigurationChanged(e: vscode.ConfigurationChangeEvent) {
        if (!e.affectsConfiguration(extensionId, null!)) {
            this._onDidChangeAny.fire(e);

            return;
        }

        const evt: ConfigurationWillChangeEvent = {
            change: e
        };

        this._onWillChange.fire(evt);

        if (evt.transform !== undefined) {
            e = evt.transform(e);
        }

        Container.resetConfig();

        this._onDidChange.fire(e);
    }

    readonly initializingChangeEvent: vscode.ConfigurationChangeEvent = {
        affectsConfiguration: (section: string, resource?: vscode.Uri) => true
    };

    get<T>(section?: string, resource?: vscode.Uri | null, defaultValue?: T) {
        return defaultValue === undefined
            ? vscode.workspace
                  .getConfiguration(
                      section === undefined ? undefined : extensionId,
                      resource!
                  )
                  .get<T>(section === undefined ? extensionId : section)!
            : vscode.workspace
                  .getConfiguration(
                      section === undefined ? undefined : extensionId,
                      resource!
                  )
                  .get<T>(
                      section === undefined ? extensionId : section,
                      defaultValue
                  )!;
    }

    getAny<T>(section: string, resource?: vscode.Uri | null, defaultValue?: T) {
        return defaultValue === undefined
            ? vscode.workspace
                  .getConfiguration(undefined, resource!)
                  .get<T>(section)!
            : vscode.workspace
                  .getConfiguration(undefined, resource!)
                  .get<T>(section, defaultValue)!;
    }

    async getWorkspace<T>(
        section: string,
        defaultValue?: T,
        workspaceFilePath?: string
    ): Promise<T | undefined> {
        const workspaceConfiguration = await this.getWorkspaceConfiguration(
            workspaceFilePath
        );

        if (workspaceConfiguration) {
            return getConfigurationValue<T>(
                workspaceConfiguration.settings,
                `${extensionId}.${section}`,
                defaultValue
            );
        }

        return;
    }

    changed(
        e: vscode.ConfigurationChangeEvent,
        section: string,
        resource?: vscode.Uri | null
    ) {
        return e.affectsConfiguration(`${extensionId}.${section}`, resource!);
    }

    initializing(e: vscode.ConfigurationChangeEvent) {
        return e === this.initializingChangeEvent;
    }

    inspect(section?: string, resource?: vscode.Uri | null) {
        return vscode.workspace
            .getConfiguration(
                section === undefined ? undefined : extensionId,
                resource!
            )
            .inspect(section === undefined ? extensionId : section);
    }

    inspectAny(section: string, resource?: vscode.Uri | null) {
        return vscode.workspace
            .getConfiguration(undefined, resource!)
            .inspect(section);
    }

    name<K extends keyof IConfig>(name: K) {
        return Functions.propOf(emptyConfig as IConfig, name);
    }

    async update(
        section: string,
        value: any,
        target: vscode.ConfigurationTarget,
        resource?: vscode.Uri | null
    ) {
        return await vscode.workspace
            .getConfiguration(
                extensionId,
                target === vscode.ConfigurationTarget.Global
                    ? undefined
                    : resource!
            )
            .update(section, value, target);
    }

    updateAny(
        section: string,
        value: any,
        target: vscode.ConfigurationTarget,
        resource?: vscode.Uri | null
    ) {
        return vscode.workspace
            .getConfiguration(
                undefined,
                target === vscode.ConfigurationTarget.Global
                    ? undefined
                    : resource!
            )
            .update(section, value, target);
    }

    async updateEffective(
        section: string,
        value: any,
        resource: vscode.Uri | null = null
    ) {
        const inspect = await configuration.inspect(section, resource)!;

        if (inspect.workspaceFolderValue !== undefined) {
            if (value === inspect.workspaceFolderValue) {
                return undefined;
            }

            return void configuration.update(
                section,
                value,
                vscode.ConfigurationTarget.WorkspaceFolder,
                resource
            );
        }

        if (inspect.workspaceValue !== undefined) {
            if (value === inspect.workspaceValue) {
                return undefined;
            }

            return void configuration.update(
                section,
                value,
                vscode.ConfigurationTarget.Workspace
            );
        }

        if (
            inspect.globalValue === value ||
            (inspect.globalValue === undefined &&
                value === inspect.defaultValue)
        ) {
            return undefined;
        }

        return void configuration.update(
            section,
            value === inspect.defaultValue ? undefined : value,
            vscode.ConfigurationTarget.Global
        );
    }

    async updateWorkspace(
        section: string,
        value: any,
        workspaceFilePath?: string
    ) {
        const workspaceConfiguration = await this.getWorkspaceConfiguration(
            workspaceFilePath
        );

        if (workspaceConfiguration) {
            addToValueTree(
                workspaceConfiguration.settings,
                `${extensionId}.${section}`,
                value,
                vscode.window.showErrorMessage
            );

            await this.saveWorkspaceConfiguration(
                workspaceConfiguration,
                workspaceFilePath
            );
        }
    }

    async getWorkspaceConfiguration(workspaceFilePath?: string) {
        if (!workspaceFilePath) {
            const activeWorkspace = await getWorkspaceByRootPath();

            if (!activeWorkspace) {
                vscode.window.showErrorMessage(
                    'Could not read current workspace settings'
                );
                return;
            }

            workspaceFilePath = activeWorkspace.path;
        }

        try {
            const data = await readFileSync(workspaceFilePath);

            const workspaceFileContent: {
                folders: any;
                settings: any;
            } = parse(data.toString());

            return workspaceFileContent;
        } catch (error) {
            error = new VError(
                error,
                'Error while trying to update workspace settings'
            );
            vscode.window.showErrorMessage(error);
            throw error;
        }
    }

    async saveWorkspaceConfiguration(content: any, workspaceFilePath?: string) {
        if (!workspaceFilePath) {
            const activeWorkspace = await getWorkspaceByRootPath();

            if (!activeWorkspace) {
                vscode.window.showErrorMessage(
                    'Could not update current workspace settings!'
                );
                return;
            }

            workspaceFilePath = activeWorkspace.path;
        }

        try {
            const json = JSON.stringify(content, null, 4);

            writeFileSync(workspaceFilePath, json, {
                encoding: 'utf8'
            });
        } catch (err) {
            err = new VError(
                err,
                `Error while trying to save workspace settings to ${workspaceFilePath}`
            );
            vscode.window.showErrorMessage(err);
            throw err;
        }
    }
}

export const configuration = new Configuration();
