import * as uuid from 'uuid/v4';
import * as VError from 'verror';
import * as vscode from 'vscode';
import { Commands } from './common';
import { Logger } from '../logger';
import { Reporter } from '../telemetry';

export interface CommandContextParsingOptions {
    editor: boolean;
    uri: boolean;
}

export interface CommandBaseContext {
    command: string;
    editor?: vscode.TextEditor;
    uri?: vscode.Uri;
}

export interface CommandUnknownContext extends CommandBaseContext {
    type: 'unknown';
}

export interface CommandUriContext extends CommandBaseContext {
    type: 'uri';
}

export interface CommandUrisContext extends CommandBaseContext {
    type: 'uris';
    uris: vscode.Uri[];
}

export type CommandContext =
    | CommandUnknownContext
    | CommandUriContext
    | CommandUrisContext;

export abstract class AbstractCommand implements vscode.Disposable {
    protected trackSuccess: boolean = false;
    protected eventName?: string;

    protected readonly contextParsingOptions: CommandContextParsingOptions = {
        editor: false,
        uri: false
    };

    private _disposable: vscode.Disposable;

    constructor(command: Commands | Commands[]) {
        if (typeof command === 'string') {
            this._disposable = vscode.commands.registerCommand(
                command,
                (...args: any[]) => this._execute(command, ...args),
                this
            );
        } else {
            const subscriptions = (<any>command).map((cmd: string) =>
            vscode.commands.registerCommand(
                    cmd,
                    (...args: any[]) => this._execute(cmd, ...args),
                    this
                )
            );

            this._disposable = vscode.Disposable.from(...subscriptions);
        }
    }

    dispose() {
        if (this._disposable) {
            this._disposable.dispose();
        }
    }

    protected preExecute(
        context: CommandContext,
        ...args: any[]
    ): Promise<any> {
        return this.execute(...args);
    }

    abstract async execute(...args: any[]): Promise<any>;

    protected async _execute(command: string, ...args: any[]): Promise<any> {
        const operationId = uuid();
        this.eventName = `command:${command}?${encodeURIComponent(
            JSON.stringify(args)
        )}`;

        try {
            const start = process.hrtime();

            const [context, rest] = AbstractCommand.parseContext(
                command,
                { ...this.contextParsingOptions },
                ...args
            );

            let result = this.preExecute(context, rest);

            const elapsed = process.hrtime(start);
            const elapsedMs = elapsed[0] * 1e3 + elapsed[1] / 1e6;

            if (this.trackSuccess) {
                Logger.info(`Finished command, took ${elapsedMs} ms.`);
                Reporter.trackEvent(
                    this.eventName,
                    { operationId: operationId },
                    { elapsedMs: elapsedMs }
                );
            }

            return result;
        } catch (err) {
            err = new VError(err, 'Execution of command failed');
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

    private static parseContext(
        command: string,
        options: CommandContextParsingOptions,
        ...args: any[]
    ): [CommandContext, any[]] {
        let editor: vscode.TextEditor | undefined = undefined;

        let firstArg = args[0];

        if (options.uri && (firstArg === null || firstArg instanceof vscode.Uri)) {
            const [uri, ...rest] = args as [vscode.Uri, any];

            if (uri !== undefined) {
                const uris = rest[0];

                if (
                    uris !== null &&
                    Array.isArray(uris) &&
                    uris.length !== 0 &&
                    uris[0] instanceof vscode.Uri
                ) {
                    return [
                        {
                            command: command,
                            type: 'uris',
                            editor: editor,
                            uri: uri,
                            uris: uris
                        },
                        rest.slice(1)
                    ];
                }

                return [
                    { command: command, type: 'uri', editor: editor, uri: uri },
                    rest
                ];
            }

            args = args.slice(1);
        }

        return [
            { command: command, type: 'unknown', editor: editor },
            firstArg
        ];
    }
}
