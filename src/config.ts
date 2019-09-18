import { IOutputLevel } from './logger';

export interface IConfig {
    includeGlobPattern: string | string[];
    openInNewWindowWhenClickingInStatusBar: boolean;
    views: IViewConfig;
    advanced: IAdvancedConfig;
}

export interface IViewConfig {
    workspacesRefreshIconInStatusBar: boolean;
    workspacesNameInStatusBar: boolean;
    removeCurrentWorkspaceFromList: boolean;
    groups: ITreeViewConfig;
    workspaces: ITreeViewConfig;
    favorites: ITreeViewConfig;
}

export interface IAdvancedConfig {
    codeExecutable: string;
    codeInsidersExecutable: string;
    deep: number;
    excludeGlobPattern: string | string[];
    outputLevel: IOutputLevel;
    messages: {};
    telemetry: {
        enabled: boolean;
    };
}

export interface ITreeViewConfig {
    compact: boolean;
    enabled: boolean;
    location?: string;
}
