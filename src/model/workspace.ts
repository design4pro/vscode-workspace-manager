import {
    GlobalState,
    IFavoriteWorkspaces,
    IGroupWorkspaces
} from '../constants';
import { Container } from '../container';

export interface IWorkspace {
    id: string;
    name: string;
    path: string;
    rootPath: string;
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
    private _current: boolean = false;

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

    set current(value: boolean) {
        this._current = value;
    }

    get current(): boolean {
        return this._current;
    }

    get group(): string | undefined {
        const group = Container.context.globalState.get<IGroupWorkspaces>(
            GlobalState.GroupWorkspaces
        );

        return group![this.id];
    }

    async addToGroup(group?: string) {
        let workspaces = Container.context.globalState.get<IGroupWorkspaces>(
            GlobalState.FavoriteWorkspaces
        );

        if (workspaces === undefined) {
            workspaces = Object.create(null);
        }

        if (group) {
            workspaces![this.id] = group;
        } else {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { [this.id]: _, ...rest } = workspaces!;
            workspaces = rest;
        }

        await Container.context.globalState.update(
            GlobalState.FavoriteWorkspaces,
            workspaces
        );
    }

    get favorited(): boolean {
        const favorited = Container.context.globalState.get<
            IFavoriteWorkspaces
        >(GlobalState.FavoriteWorkspaces);
        return favorited !== undefined && favorited[this.id] === true;
    }

    favorite() {
        return this.updateFavorite(true);
    }

    unfavorite() {
        return this.updateFavorite(false);
    }

    private async updateFavorite(favorite: boolean) {
        let favorited = Container.context.globalState.get<IFavoriteWorkspaces>(
            GlobalState.FavoriteWorkspaces
        );

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

        await Container.context.globalState.update(
            GlobalState.FavoriteWorkspaces,
            favorited
        );
    }
}
