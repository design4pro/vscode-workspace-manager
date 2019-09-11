import { FavoriteWorkspaces, WorkspaceState } from '../constants';
import { Container } from '../container';
import { Memoize } from '../system/decorators/memoize';

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
    workspace?: Workspace;
    inNewWindow?: boolean;
}

export class Workspace {
    static is(workspace: any): workspace is Workspace {
        return workspace instanceof Workspace;
    }

    readonly id: string;
    readonly group?: string;

    constructor(public readonly workspace: WorkspaceEntry) {
        this.id = workspace.id;
        this.group = workspace.group;
    }

    @Memoize()
    getName(): string {
        return this.workspace.name;
    }

    @Memoize()
    getPath(): string {
        return this.workspace.path;
    }

    @Memoize()
    getRootPath(): string {
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
