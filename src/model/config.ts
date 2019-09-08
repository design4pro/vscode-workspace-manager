export enum IOutputLevel {
    Silent = 'silent',
    Errors = 'errors',
    Verbose = 'verbose',
    Debug = 'debug',
    Info = 'info'
}

export interface IConfig {
    includeGlobPattern: string | string[];
    openInNewWindowWhenClickingInStatusBar: boolean;
    views: IViewConfig;
    advanced: IAdvancedConfig;
}

export interface IViewConfig {
    showInActivityBar: boolean;
    showInExplorer: boolean;
    showWorkspaceRefreshIconInStatusBar: boolean;
    showWorkspaceNameInStatusBar: boolean;
    removeCurrentWorkspaceFromList: boolean;
    groups: ITreeViewConfig;
    workspaces: ITreeViewConfig;
}

export interface IAdvancedConfig {
    codeExecutable: string;
    codeInsidersExecutable: string;
    deep: number;
    excludeGlobPattern: string | string[];
    outputLevel: IOutputLevel;
    telemetry: {
        enabled: boolean;
    };
}

export interface ITreeViewConfig {
    compact: boolean;
    enabled: boolean;
}
