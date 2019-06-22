'use strict';

export enum OutputLevel {
    Silent = 'silent',
    Errors = 'errors',
    Verbose = 'verbose',
    Debug = 'debug',
    Info = 'info'
}

export interface IConfig {
    outputLevel: OutputLevel;
    enableCharles: boolean;
    offlineMode: boolean;
    showWelcomeOnInstall: boolean;
}

export interface Config {
    outputLevel: OutputLevel;
}

export interface AdvancedConfig {
    enableTelemetry: boolean;
}

export class ExtensionConfig {
    public paths = null;
}
