import * as uuid from 'uuid/v4';
import * as VError from 'verror';
import * as vscode from 'vscode';
import { configuration } from '../configuration';
import { Container } from '../container';
import { Logger } from '../logger';
import { Reporter } from '../telemetry';
import { TreeDataProvider } from '../util/explorer/treeDataProvider';
import { Views } from './common';

export abstract class AbstractView implements vscode.Disposable {
    protected trackSuccess: boolean = false;
    protected eventName?: string;

    private _disposable: vscode.Disposable;

    constructor(
        protected readonly view: Views | Views[],
        protected treeData: TreeDataProvider
    ) {
        if (typeof view === 'string') {
            this._disposable = vscode.window.registerTreeDataProvider(view, <
                TreeDataProvider
            >this._execute(view));
        } else {
            const subscriptions = (<any>view).map((view: string) =>
                vscode.window.registerTreeDataProvider(view, <TreeDataProvider>(
                    this._execute(view)
                ))
            );

            this._disposable = vscode.Disposable.from(...subscriptions);
        }

        this.registerCommands();

        Container.context.subscriptions.push(
            configuration.onDidChange(this.onConfigurationChanged, this)
        );

        setImmediate(() =>
            this.onConfigurationChanged(configuration.initializingChangeEvent)
        );
    }

    dispose() {
        if (this._disposable) {
            this._disposable.dispose();
        }
    }

    protected abstract registerCommands(): void;

    protected onConfigurationChanged(e: vscode.ConfigurationChangeEvent) {
        if (
            !configuration.changed(
                e,
                configuration.name('includeGlobPattern').value
            ) &&
            !configuration.changed(
                e,
                configuration.name('view')('removeCurrentWorkspaceFromList')
                    .value
            ) &&
            !configuration.changed(
                e,
                configuration.name('advanced')('excludeGlobPattern').value
            ) &&
            !configuration.changed(
                e,
                configuration.name('advanced')('deep').value
            )
        ) {
            return;
        }

        if (!configuration.initializing(e)) {
            void this.refresh();
        }
    }

    protected _execute(view: string): TreeDataProvider | undefined {
        const operationId = uuid();
        this.eventName = `view:${view}`;

        try {
            const start = process.hrtime();
            const result = this.treeData;
            const elapsed = process.hrtime(start);
            const elapsedMs = elapsed[0] * 1e3 + elapsed[1] / 1e6;

            if (this.trackSuccess) {
                Logger.info(`Finished view, took ${elapsedMs} ms.`);
                Reporter.trackEvent(
                    this.eventName,
                    { operationId: operationId },
                    { elapsedMs: elapsedMs }
                );
            }

            return result;
        } catch (err) {
            err = new VError(err, 'Execution of view failed');
            Logger.error(err);

            if (Reporter.enabled) {
                Logger.info(
                    `If you open a bugreport at https://github.com/design4pro/vscode-workspace-manager/issues, please supply this operation ID: ${operationId}`
                );
                Reporter.trackException(err, this.eventName, {
                    operationId: operationId
                });
            }
        }
    }

    refresh() {
        this.treeData.refresh();
    }
}
