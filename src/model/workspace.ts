import { commands, MessageItem, QuickPickItem, Uri, window } from 'vscode';
import { Commands } from '../commands/common';
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

            if (name === undefined || name.length === 0) return undefined;

            if (group) {
                group[this.id] = name;
            }
        } else {
            class RemoveQuickInputButton implements RemoveQuickInputButton {
                constructor(
                    public iconPath: { light: Uri; dark: Uri },
                    public tooltip: string
                ) {}
            }

            class AddQuickInputButton implements AddQuickInputButton {
                constructor(
                    public iconPath: { light: Uri; dark: Uri },
                    public tooltip: string
                ) {}
            }

            const removeGroupButton = new RemoveQuickInputButton(
                {
                    dark: Uri.file(
                        Container.context.asAbsolutePath(
                            'resources/dark/remove.svg'
                        )
                    ),
                    light: Uri.file(
                        Container.context.asAbsolutePath(
                            'resources/light/remove.svg'
                        )
                    )
                },
                'Remove from Group'
            );

            const addGroupButton = new AddQuickInputButton(
                {
                    dark: Uri.file(
                        Container.context.asAbsolutePath(
                            'resources/dark/add.svg'
                        )
                    ),
                    light: Uri.file(
                        Container.context.asAbsolutePath(
                            'resources/light/add.svg'
                        )
                    )
                },
                'Add new Group'
            );

            interface State {
                title: string;
                step: number;
                totalSteps: number;
                group: QuickPickItem | string;
                name: string;
                runtime: QuickPickItem;
            }

            const collectInputs = async () => {
                const state = {} as Partial<State>;
                await MultiStepInput.run(input => pickGroup(input, state));
                return state as State;
            };

            const title = 'Workspaces Groups';

            const pickGroup = async (
                input: MultiStepInput,
                state: Partial<State>
            ) => {
                const pick = await input.showQuickPick({
                    title,
                    step: 1,
                    totalSteps: 2,
                    placeholder:
                        'Pick a workspace group or add new group by clicking +',
                    items: groups,
                    activeItem:
                        typeof state.group !== 'string'
                            ? state.group
                            : undefined,
                    buttons: [removeGroupButton, addGroupButton],
                    shouldResume: shouldResume
                });

                if (pick instanceof RemoveQuickInputButton) {
                    const actions: MessageItem[] = [
                        { title: 'Yes' },
                        { title: 'No', isCloseAffordance: true }
                    ];

                    const result = await window.showInformationMessage(
                        `Remove workspace '${this.name}' from group '${this.group}'?`,
                        ...actions
                    );

                    if (result !== undefined && result.title === 'Yes') {
                        state.group = undefined;
                    } else {
                        state.group = this.group;
                    }
                } else if (pick instanceof AddQuickInputButton) {
                    return (input: MultiStepInput) =>
                        inputGroupName(input, state);
                } else {
                    state.group = pick;
                }
            };

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
                return undefined;
            }

            const state = await collectInputs();

            if (group) {
                if (!state.group) {
                    const { [this.id]: _, ...rest } = group!;

                    group = rest;

                    window.showInformationMessage(
                        `Workspace '${this.name}' was removed from group '${this.group}'.`
                    );
                } else if (typeof state.group === 'string') {
                    group[this.id] = state.group;
                    window.showInformationMessage(
                        `Workspace '${this.name}' was added from group '${state.group}'.`
                    );
                } else if (state.group.label) {
                    group[this.id] = state.group.label;
                    window.showInformationMessage(
                        `Workspace '${this.name}' was added from group '${state.group.label}'.`
                    );
                }
            }
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

            window.showInformationMessage(
                `Workspace '${this.name}' was added to favorites.`
            );
        } else {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { [this.id]: _, ...rest } = favorited!;
            favorited = rest;

            window.showInformationMessage(
                `Workspace '${this.name}' was removed from favorites.`
            );
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
            if (
                r.group &&
                typeof r.group === 'string' &&
                !groups.includes(r.group)
            ) {
                groups.push(r.group);
            }
        });

        return groups.map(label => ({ label }));
    }

    switchWorkspace() {
        commands.executeCommand(Commands.SwitchToWorkspace, {
            workspace: this
        });
    }

    switchWorkspaceInNewWindow() {
        commands.executeCommand(Commands.SwitchToWorkspace, {
            workspace: this,
            inNewWindow: true
        });
    }
}
