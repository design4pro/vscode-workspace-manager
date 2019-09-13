import {
    IFavoriteWorkspaces,
    WorkspaceState,
    IGroupWorkspaces
} from '../constants';
import { Container } from '../container';

export interface IWorkspace {
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

    constructor(public readonly workspace: IWorkspace) {
        this.id = workspace.id;
    }

    get name(): string {
        return this.workspace.name;
    }

    get path(): string {
        return this.workspace.path;
    }

    get rootPath(): string {
        return this.workspace.rootPath;
    }

    get group() {
        const favorited = Container.context.workspaceState.get<
            IGroupWorkspaces
        >(WorkspaceState.GroupWorkspaces);
        return favorited !== undefined && favorited[this.id] === true;
    }

    get favorited() {
        const favorited = Container.context.workspaceState.get<
            IFavoriteWorkspaces
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
            IFavoriteWorkspaces
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
