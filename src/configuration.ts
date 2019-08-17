import * as vscode from 'vscode';
import { extensionId } from './constants';
import { Container } from './container';
import { IConfig } from './model/config';
import { Functions } from './system/function';

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
}

export const configuration = new Configuration();
