import { QuickPickItem, Uri, window } from 'vscode';
import {
    GlobalState,
    IFavoriteWorkspaces,
    IGroupWorkspaces
} from '../constants';
import { Container } from '../container';
import { getWorkspaces } from '../util/getWorkspaces';
import { MultiStepInput } from '../util/quickPick/multisetpInput';

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

        return group ? group[this.id] : undefined;
    }

    async addToGroup() {
        let group = Container.context.globalState.get<IGroupWorkspaces>(
            GlobalState.GroupWorkspaces
        );

        if (group === undefined) {
            group = Object.create(null);
        }

        const groups = await this.getGroups();

        if (!groups || !groups.length) {
            const name = await window.showInputBox({
                prompt: 'Please provide a name for the group',
                placeHolder: 'Group name',
                value: undefined,
                ignoreFocusOut: true
            });

            console.log(name);

            if (name === undefined || name.length === 0) return undefined;

            group![this.id] = name;
        } else {
            class QuickInputButton implements QuickInputButton {
                constructor(
                    public iconPath: { light: Uri; dark: Uri },
                    public tooltip: string
                ) {}
            }

            const createGroupButton = new QuickInputButton(
                {
                    dark: Uri.file(
                        Container.context.asAbsolutePath(
                            'resources/dark/save.svg'
                        )
                    ),
                    light: Uri.file(
                        Container.context.asAbsolutePath(
                            'resources/light/save.svg'
                        )
                    )
                },
                'Create Workspace Group'
            );

            interface State {
                title: string;
                step: number;
                totalSteps: number;
                group: QuickPickItem | string;
                name: string;
                runtime: QuickPickItem;
            }

            async function collectInputs() {
                const state = {} as Partial<State>;
                await MultiStepInput.run(input => pickGroup(input, state));
                return state as State;
            }

            const title = 'Create Workspace Group';

            async function pickGroup(
                input: MultiStepInput,
                state: Partial<State>
            ) {
                const pick = await input.showQuickPick({
                    title,
                    step: 1,
                    totalSteps: 2,
                    placeholder: 'Pick a workspace group',
                    items: groups,
                    activeItem:
                        typeof state.group !== 'string'
                            ? state.group
                            : undefined,
                    buttons: [createGroupButton],
                    shouldResume: shouldResume
                });
                if (pick instanceof QuickInputButton) {
                    return (input: MultiStepInput) =>
                        inputGroupName(input, state);
                }
                state.group = pick;
            }

            async function inputGroupName(
                input: MultiStepInput,
                state: Partial<State>
            ) {
                state.group = await input.showInputBox({
                    title,
                    step: 2,
                    totalSteps: 2,
                    value: typeof state.group === 'string' ? state.group : '',
                    prompt: 'Choose a unique name for the group',
                    validate: validateNameIsUnique,
                    shouldResume: shouldResume
                });
            }

            function shouldResume() {
                // Could show a notification with the option to resume.
                return new Promise<boolean>((resolve, reject) => {});
            }

            async function validateNameIsUnique(name: string) {
                // ...validate...
                await new Promise(resolve => setTimeout(resolve, 1000));
                return name === 'vscode' ? 'Name not unique' : undefined;
            }

            const state = await collectInputs();
        }

        await Container.context.globalState.update(
            GlobalState.GroupWorkspaces,
            group
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

    private async getGroups(): Promise<QuickPickItem[]> {
        const workspaces = await getWorkspaces();

        if (!workspaces) {
            return [];
        }

        const groups: string[] = [];

        workspaces.map(r => {
            if (r.group && !groups.includes(r.group)) {
                groups.push(r.group);
            }
        });

        return groups.map(label => ({ label }));
    }
}
