import { commands, Disposable, TextEditor, Uri } from 'vscode';
import { Commands } from './common';

export interface CommandContextParsingOptions {
    editor: boolean;
    uri: boolean;
}

export interface CommandBaseContext {
    command: string;
    editor?: TextEditor;
    uri?: Uri;
}

export interface CommandUnknownContext extends CommandBaseContext {
    type: 'unknown';
}

export interface CommandUriContext extends CommandBaseContext {
    type: 'uri';
}

export interface CommandUrisContext extends CommandBaseContext {
    type: 'uris';
    uris: Uri[];
}

export type CommandContext =
    | CommandUnknownContext
    | CommandUriContext
    | CommandUrisContext;

export abstract class AbstractCommand implements Disposable {
    static getMarkdownCommandArgsCore<T>(command: Commands, args: T): string {
        return `command:${command}?${encodeURIComponent(JSON.stringify(args))}`;
    }

    protected readonly contextParsingOptions: CommandContextParsingOptions = {
        editor: false,
        uri: false
    };

    private _disposable: Disposable;

    constructor(command: Commands | Commands[]) {
        if (typeof command === 'string') {
            this._disposable = commands.registerCommand(
                command,
                (...args: any[]) => this._execute(command, ...args),
                this
            );

            return;
        }

        const subscriptions = (<any>command).map((cmd: string) =>
            commands.registerCommand(
                cmd,
                (...args: any[]) => this._execute(cmd, ...args),
                this
            )
        );

        this._disposable = Disposable.from(...subscriptions);
    }

    dispose() {
        this._disposable && this._disposable.dispose();
    }

    protected preExecute(
        context: CommandContext,
        ...args: any[]
    ): Promise<any> {
        return this.execute(...args);
    }

    abstract execute(...args: any[]): any;

    protected _execute(command: string, ...args: any[]): any {
        // Telemetry.trackEvent(command);

        const [context, rest] = AbstractCommand.parseContext(
            command,
            { ...this.contextParsingOptions },
            ...args
        );
        return this.preExecute(context, ...rest);
    }

    private static parseContext(
        command: string,
        options: CommandContextParsingOptions,
        ...args: any[]
    ): [CommandContext, any[]] {
        let editor: TextEditor | undefined = undefined;

        let firstArg = args[0];

        if (options.uri && (firstArg === null || firstArg instanceof Uri)) {
            const [uri, ...rest] = args as [Uri, any];
            if (uri !== undefined) {
                const uris = rest[0];
                if (
                    uris != null &&
                    Array.isArray(uris) &&
                    uris.length !== 0 &&
                    uris[0] instanceof Uri
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

        return [{ command: command, type: 'unknown', editor: editor }, args];
    }
}
