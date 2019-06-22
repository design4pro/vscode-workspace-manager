'use strict';

import * as uuid from 'uuid/v4';
import * as VError from 'verror';
import { Disposable, window } from 'vscode';
import { Logger } from '../logger';
import { Reporter } from '../telemetry';
import { WorkspaceExplorerTreeDataProvider } from '../util/explorer/workspaceExplorerTreeDataProvider';
import { Views } from './common';

export abstract class AbstractView implements Disposable {
    protected trackSuccess: boolean = false;
    protected eventName: string;

    private _disposable: Disposable;

    constructor(view: Views | Views[]) {
        if (typeof view === 'string') {
            this._disposable = window.registerTreeDataProvider(
                view,
                this._execute(view)
            );

            return;
        }
        const subscriptions = (<any>view).map((view: string) =>
            window.registerTreeDataProvider(view, this._execute(view))
        );

        this._disposable = Disposable.from(...subscriptions);
    }

    dispose() {
        if (this._disposable) {
            this._disposable.dispose();
        }
    }

    abstract execute(): WorkspaceExplorerTreeDataProvider;

    protected _execute(view: string): WorkspaceExplorerTreeDataProvider {
        const operationId = uuid();
        this.eventName = `view:${view}`;

        try {
            const start = process.hrtime();

            const result = this.execute();

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
}
