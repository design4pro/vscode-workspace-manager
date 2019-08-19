export enum IOutputLevel {
    Silent = 'silent',
    Errors = 'errors',
    Verbose = 'verbose',
    Debug = 'debug',
    Info = 'info'
}

export interface IConfig {
    includeGlobPattern: string | string[];
    showInActivityBar: boolean;
    showInExplorer: boolean;
    outputLevel: IOutputLevel;
    advanced: IAdvancedConfig;
}

export interface IAdvancedConfig {
    codeExecutable: string;
    codeInsidersExecutable: string;
    deep: number;
    excludeGlobPattern: string | string[];
    telemetry: {
        enabled: boolean;
    };
}
