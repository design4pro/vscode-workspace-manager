export interface WorkspaceEntry {
    name: string;
    path: string;
    rootPath: string;
    isFavorite?: boolean;
}

export interface IWorkspaceCommandArgs {
    workspaceEntry?: WorkspaceEntry;
    inNewWindow?: boolean;
}
