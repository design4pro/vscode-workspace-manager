'use strict';

import {
    ConfigurationChangeEvent,
    ExtensionContext,
    OutputChannel,
    Uri,
    window
} from 'vscode';
import { configuration } from './configuration';
import { extensionOutputChannelName } from './constants';
import { Container } from './container';
import { IOutputLevel } from './model/config';
import { Reporter } from './telemetry';

export interface LogCorrelationContext {
    readonly correlationId?: number;
    readonly prefix: string;
    exitDetails?: string;
}

const emptyStr = '';

const consolePrefix = `[${extensionOutputChannelName}]`;

export class Logger {
    static output: OutputChannel | undefined;
    static customLoggableFn: ((o: object) => string | undefined) | undefined;

    static prefix = consolePrefix;

    static configure(
        context: ExtensionContext,
        level?: IOutputLevel,
        loggableFn?: (o: any) => string | undefined
    ) {
        this.customLoggableFn = loggableFn;

        this.level = level;

        context.subscriptions.push(
            configuration.onDidChange(this.onConfigurationChanged, this)
        );
        this.onConfigurationChanged(configuration.initializingChangeEvent);
    }

    private static onConfigurationChanged(e: ConfigurationChangeEvent) {
        const initializing = configuration.initializing(e);

        const section = 'outputLevel';
        if (initializing && Container.isDebugging) {
            this.level = IOutputLevel.Debug;
        } else if (initializing || configuration.changed(e, section)) {
            this.level = configuration.get<IOutputLevel>(section);
        }

        if (this.level === IOutputLevel.Silent) {
            if (this.output !== undefined) {
                this.output.dispose();
                this.output = undefined;
            }
        } else {
            this.output =
                this.output ||
                window.createOutputChannel(extensionOutputChannelName);
        }
    }

    private static _level: IOutputLevel = IOutputLevel.Silent;

    static get level() {
        return this._level;
    }

    static set level(value: IOutputLevel) {
        this._level = value;

        if (value === IOutputLevel.Silent) {
            if (this.output !== undefined) {
                this.output.dispose();
                this.output = undefined;
            }
        } else {
            this.output =
                this.output ||
                window.createOutputChannel(extensionOutputChannelName);
        }
    }

    static info(message: string, ...params: any[]): void;
    static info(
        context: LogCorrelationContext | undefined,
        message: string,
        ...params: any[]
    ): void;
    static info(
        contextOrMessage: LogCorrelationContext | string | undefined,
        ...params: any[]
    ): void {
        if (
            this.level !== IOutputLevel.Info &&
            this.level !== IOutputLevel.Debug
        ) {
            return;
        }

        let message;
        if (typeof contextOrMessage === 'string') {
            message = contextOrMessage;
        } else {
            message = params.shift();

            if (contextOrMessage !== undefined) {
                message = `${contextOrMessage.prefix} ${message || emptyStr}`;
            }
        }

        if (Container.isDebugging) {
            console.info(
                this.timestamp,
                this.prefix,
                message || emptyStr,
                ...params
            );
        }

        if (
            this.output !== undefined &&
            (this.level === IOutputLevel.Info ||
                this.level === IOutputLevel.Debug)
        ) {
            this.output.appendLine(
                `${this.timestamp} ${message ||
                    emptyStr}${this.toLoggableParams(false, params)}`
            );
        }
    }

    static debug(message: string, ...params: any[]): void;
    static debug(
        context: LogCorrelationContext | undefined,
        message: string,
        ...params: any[]
    ): void;
    static debug(
        contextOrMessage: LogCorrelationContext | string | undefined,
        ...params: any[]
    ): void {
        if (this.level !== IOutputLevel.Debug && !Container.isDebugging) {
            return;
        }

        let message;
        if (typeof contextOrMessage === 'string') {
            message = contextOrMessage;
        } else {
            message = params.shift();

            if (contextOrMessage !== undefined) {
                message = `${contextOrMessage.prefix} ${message || emptyStr}`;
            }
        }

        if (Container.isDebugging) {
            console.log(
                this.timestamp,
                this.prefix,
                message || emptyStr,
                ...params
            );
        }

        if (this.output !== undefined && this.level === IOutputLevel.Debug) {
            this.output.appendLine(
                `${this.timestamp} ${message ||
                    emptyStr}${this.toLoggableParams(true, params)}`
            );
        }
    }

    static error(ex: Error, message?: string, ...params: any[]): void;
    static error(
        ex: Error,
        context?: LogCorrelationContext,
        message?: string,
        ...params: any[]
    ): void;
    static error(
        ex: Error,
        contextOrMessage: LogCorrelationContext | string | undefined,
        ...params: any[]
    ): void {
        if (this.level === IOutputLevel.Silent && !Container.isDebugging) {
            return;
        }

        let message;
        if (
            contextOrMessage === undefined ||
            typeof contextOrMessage === 'string'
        ) {
            message = contextOrMessage;
        } else {
            message = params.shift();

            if (contextOrMessage !== undefined) {
                message = `${contextOrMessage.prefix} ${message || emptyStr}`;
            }
        }

        if (message === undefined) {
            const stack = ex.stack;
            if (stack) {
                const match = /.*\s*?at\s(.+?)\s/.exec(stack);
                if (match !== null) {
                    message = match[1];
                }
            }
        }

        if (Container.isDebugging) {
            console.error(
                this.timestamp,
                this.prefix,
                message || emptyStr,
                ...params,
                ex
            );
        }

        if (this.output !== undefined && this.level !== IOutputLevel.Silent) {
            this.output.appendLine(
                `${this.timestamp} ${message ||
                    emptyStr}${this.toLoggableParams(false, params)}\n${ex}`
            );
        }

        Reporter.trackException(ex);
    }

    static log(message: string, ...params: any[]): void;
    static log(
        context: LogCorrelationContext | undefined,
        message: string,
        ...params: any[]
    ): void;
    static log(
        contextOrMessage: LogCorrelationContext | string | undefined,
        ...params: any[]
    ): void {
        if (
            this.level !== IOutputLevel.Verbose &&
            this.level !== IOutputLevel.Debug &&
            !Container.isDebugging
        ) {
            return;
        }

        let message;
        if (typeof contextOrMessage === 'string') {
            message = contextOrMessage;
        } else {
            message = params.shift();

            if (contextOrMessage !== undefined) {
                message = `${contextOrMessage.prefix} ${message || emptyStr}`;
            }
        }

        if (Container.isDebugging) {
            console.log(
                this.timestamp,
                this.prefix,
                message || emptyStr,
                ...params
            );
        }

        if (
            this.output !== undefined &&
            (this.level === IOutputLevel.Verbose ||
                this.level === IOutputLevel.Debug)
        ) {
            this.output.appendLine(
                `${this.timestamp} ${message ||
                    emptyStr}${this.toLoggableParams(false, params)}`
            );
        }
    }

    static warn(message: string, ...params: any[]): void;
    static warn(
        context: LogCorrelationContext | undefined,
        message: string,
        ...params: any[]
    ): void;
    static warn(
        contextOrMessage: LogCorrelationContext | string | undefined,
        ...params: any[]
    ): void {
        if (this.level === IOutputLevel.Silent && !Container.isDebugging) {
            return;
        }

        let message;
        if (typeof contextOrMessage === 'string') {
            message = contextOrMessage;
        } else {
            message = params.shift();

            if (contextOrMessage !== undefined) {
                message = `${contextOrMessage.prefix} ${message || emptyStr}`;
            }
        }

        if (Container.isDebugging) {
            console.warn(
                this.timestamp,
                this.prefix,
                message || emptyStr,
                ...params
            );
        }

        if (this.output !== undefined && this.level !== IOutputLevel.Silent) {
            this.output.appendLine(
                `${this.timestamp} ${message ||
                    emptyStr}${this.toLoggableParams(false, params)}`
            );
        }
    }

    static toLoggable(
        p: any,
        sanitize?: ((key: string, value: any) => any) | undefined
    ) {
        if (typeof p !== 'object') {
            return String(p);
        }
        if (this.customLoggableFn !== undefined) {
            const loggable = this.customLoggableFn(p);
            if (loggable !== null) {
                return loggable;
            }
        }
        if (p instanceof Uri) {
            return `Uri(${p.toString(true)})`;
        }

        try {
            return JSON.stringify(p, sanitize);
        } catch {
            return '<error>';
        }
    }

    private static toLoggableParams(debugOnly: boolean, params: any[]) {
        if (
            params.length === 0 ||
            (debugOnly &&
                this.level !== IOutputLevel.Debug &&
                !Container.isDebugging)
        ) {
            return emptyStr;
        }

        const loggableParams = params.map(p => this.toLoggable(p)).join(', ');
        return loggableParams.length !== 0
            ? ` \u2014 ${loggableParams}`
            : emptyStr;
    }

    private static get timestamp(): string {
        const now = new Date();
        const time = now
            .toISOString()
            .replace(/T/, ' ')
            .replace(/\..+/, '');
        return `[${time}:${('00' + now.getUTCMilliseconds()).slice(-3)}]`;
    }
}
