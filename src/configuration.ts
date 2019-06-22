import {
    ConfigurationChangeEvent,
    workspace,
    ExtensionContext,
    EventEmitter,
    Event,
    Uri,
    ConfigurationTarget
} from 'vscode';
import { extensionId } from './constants';
import { Functions } from './system/function';
import { Config } from './config';

const emptyConfig: Config = new Proxy<Config>({} as Config, {
    get: function() {
        return emptyConfig;
    }
});

export interface ConfigurationWillChangeEvent {
    change: ConfigurationChangeEvent;
    transform?(e: ConfigurationChangeEvent): ConfigurationChangeEvent;
}

export class Configuration {
    static configure(context: ExtensionContext) {
        context.subscriptions.push(
            workspace.onDidChangeConfiguration(
                configuration.onConfigurationChanged,
                configuration
            )
        );
    }

    private _onDidChange = new EventEmitter<ConfigurationChangeEvent>();
    get onDidChange(): Event<ConfigurationChangeEvent> {
        return this._onDidChange.event;
    }

    private _onDidChangeAny = new EventEmitter<ConfigurationChangeEvent>();
    get onDidChangeAny(): Event<ConfigurationChangeEvent> {
        return this._onDidChange.event;
    }

    private _onWillChange = new EventEmitter<ConfigurationWillChangeEvent>();
    get onWillChange(): Event<ConfigurationWillChangeEvent> {
        return this._onWillChange.event;
    }

    private onConfigurationChanged(e: ConfigurationChangeEvent) {
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

        this._onDidChange.fire(e);
    }

    readonly initializingChangeEvent: ConfigurationChangeEvent = {
        affectsConfiguration: (section: string, resource?: Uri) => true
    };

    get<T>(section?: string, resource?: Uri | null, defaultValue?: T) {
        return defaultValue === undefined
            ? workspace
                  .getConfiguration(
                      section === undefined ? undefined : extensionId,
                      resource!
                  )
                  .get<T>(section === undefined ? extensionId : section)!
            : workspace
                  .getConfiguration(
                      section === undefined ? undefined : extensionId,
                      resource!
                  )
                  .get<T>(
                      section === undefined ? extensionId : section,
                      defaultValue
                  )!;
    }

    getAny<T>(section: string, resource?: Uri | null, defaultValue?: T) {
        return defaultValue === undefined
            ? workspace.getConfiguration(undefined, resource!).get<T>(section)!
            : workspace
                  .getConfiguration(undefined, resource!)
                  .get<T>(section, defaultValue)!;
    }

    changed(
        e: ConfigurationChangeEvent,
        section: string,
        resource?: Uri | null
    ) {
        return e.affectsConfiguration(`${extensionId}.${section}`, resource!);
    }

    initializing(e: ConfigurationChangeEvent) {
        return e === this.initializingChangeEvent;
    }

    inspect(section?: string, resource?: Uri | null) {
        return workspace
            .getConfiguration(
                section === undefined ? undefined : extensionId,
                resource!
            )
            .inspect(section === undefined ? extensionId : section);
    }

    inspectAny(section: string, resource?: Uri | null) {
        return workspace
            .getConfiguration(undefined, resource!)
            .inspect(section);
    }

    name<K extends keyof Config>(name: K) {
        return Functions.propOf(emptyConfig as Config, name);
    }

    update(
        section: string,
        value: any,
        target: ConfigurationTarget,
        resource?: Uri | null
    ) {
        return workspace
            .getConfiguration(
                extensionId,
                target === ConfigurationTarget.Global ? undefined : resource!
            )
            .update(section, value, target);
    }

    updateAny(
        section: string,
        value: any,
        target: ConfigurationTarget,
        resource?: Uri | null
    ) {
        return workspace
            .getConfiguration(
                undefined,
                target === ConfigurationTarget.Global ? undefined : resource!
            )
            .update(section, value, target);
    }

    async updateEffective(
        section: string,
        value: any,
        resource: Uri | null = null
    ) {
        const inspect = await configuration.inspect(section, resource)!;
        if (inspect.workspaceFolderValue !== undefined) {
            if (value === inspect.workspaceFolderValue) {
                return undefined;
            }

            return void configuration.update(
                section,
                value,
                ConfigurationTarget.WorkspaceFolder,
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
                ConfigurationTarget.Workspace
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
            ConfigurationTarget.Global
        );
    }
}

export const configuration = new Configuration();
