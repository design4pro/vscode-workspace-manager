'use strict';

export enum IOutputLevel {
    Silent = 'silent',
    Errors = 'errors',
    Verbose = 'verbose',
    Debug = 'debug',
    Info = 'info'
}

export interface IConfig {
    paths: string[];
    codeExecutable: string;
    codeInsidersExecutable: string;
    showInActivityBar: boolean;
    showInExplorer: boolean;
    outputLevel: IOutputLevel;
    advanced: IAdvancedConfig;
}

export interface IAdvancedConfig {
    telemetry: {
        enabled: boolean;
    };
}
