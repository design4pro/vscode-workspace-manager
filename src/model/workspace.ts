export interface WorkspaceEntry {
    id: string;
    name: string;
    path: string;
    rootPath: string;
    favorite?: boolean;
    active?: boolean;
}

export interface IWorkspaceCommandArgs {
    workspaceEntry?: WorkspaceEntry;
    inNewWindow?: boolean;
}
