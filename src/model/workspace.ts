export interface WorkspaceEntry {
    id: string;
    name: string;
    path: string;
    rootPath: string;
    group: string | undefined;
    favorite: boolean;
    current: boolean;
}

export interface IWorkspaceCommandArgs {
    workspaceEntry?: WorkspaceEntry;
    inNewWindow?: boolean;
}

export class Workspace {}
