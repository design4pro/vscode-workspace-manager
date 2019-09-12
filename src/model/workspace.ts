import { FavoriteWorkspaces, WorkspaceState } from '../constants';
import { Container } from '../container';

export interface WorkspaceEntry {
    id: string;
    name: string;
    path: string;
    rootPath: string;
    group: string | undefined;
}

export interface IWorkspaceCommandArgs {
    workspace?: Workspace;
    inNewWindow?: boolean;
}

export class Workspace {
    static is(workspace: any): workspace is Workspace {
        return workspace instanceof Workspace;
    }

    readonly id: string;
    readonly name: string;
    readonly group?: string;

    constructor(public readonly workspace: WorkspaceEntry) {
        this.id = workspace.id;
        this.name = workspace.name;
        this.group = workspace.group;
    }

    get getName(): string {
        return this.name;
    }

    get getPath(): string {
        return this.workspace.path;
    }

    get getRootPath(): string {
        return this.workspace.rootPath;
    }

    get favorited() {
        const favorited = Container.context.workspaceState.get<
            FavoriteWorkspaces
        >(WorkspaceState.FavoriteWorkspaces);
        return favorited !== undefined && favorited[this.id] === true;
    }

    favorite() {
        return this.updateFavorite(true);
    }

    unfavorite() {
        return this.updateFavorite(false);
    }

    private async updateFavorite(favorite: boolean) {
        let favorited = Container.context.workspaceState.get<
            FavoriteWorkspaces
        >(WorkspaceState.FavoriteWorkspaces);
        if (favorited === undefined) {
            favorited = Object.create(null);
        }

        if (favorite) {
            favorited![this.id] = true;
        } else {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { [this.id]: _, ...rest } = favorited!;
            favorited = rest;
        }
        await Container.context.workspaceState.update(
            WorkspaceState.FavoriteWorkspaces,
            favorited
        );
    }
}
