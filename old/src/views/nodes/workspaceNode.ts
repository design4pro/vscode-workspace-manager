import * as uuid from 'uuid';
import { Command, TreeItem, TreeItemCollapsibleState, Uri } from 'vscode';
import { Container } from '../../container';
import { IWorkspaceCommandArgs, Workspace } from '../../model/workspace';
import { Debug, Gate } from '../../system';
import { View } from '../viewBase';
import { Commands } from './../../commands/common';
import { PageableViewNode, ResourceType, ViewNode } from './viewNode';

export class WorkspaceNode extends ViewNode<View> implements PageableViewNode {
    readonly supportsPaging = true;
    readonly rememberLastMaxCount = true;
    maxCount: number | undefined = this.view.getNodeLastMaxCount(this);

    private _children: ViewNode[] | undefined;

    constructor(
        view: View,
        parent: ViewNode,
        public readonly workspace: Workspace,
        private readonly _root: boolean = false
    ) {
        super(view, parent);
    }

    get id(): string {
        const id = uuid();

        return `workspaceManager:workspace(${this.workspace.id || id})${
            this._root ? ':root:' : ''
        }${this.workspace.group ? '+group' : ''}${
            this.current ? '+current' : ''
        }${this.workspace.favorited ? '+favorite' : ''}`;
    }

    get current(): boolean {
        return !!this.workspace.current;
    }

    get label(): string {
        return this.workspace.name;
    }

    async getTreeItem(): Promise<TreeItem> {
        let tooltip = `${this.label}${this.current ? ' (current)' : ''}\n${
            this.workspace.path
        }`;
        let iconSuffix = '';

        let description;

        const item = new TreeItem(
            `${this.label}`,
            TreeItemCollapsibleState.None
        );

        item.contextValue = ResourceType.Workspace;

        if (this.current) {
            item.contextValue += '+current';
            iconSuffix += '-current';
        }

        if (this.workspace.favorited) {
            item.contextValue += '+favorite';
            iconSuffix += '-favorite';
        }

        if (this.workspace.group) {
            item.contextValue += '+group';
        }

        item.description = description;
        item.iconPath = {
            dark: Uri.file(
                Container.context.asAbsolutePath(
                    `resources/dark/folder${iconSuffix}.svg`
                )
            ),
            light: Uri.file(
                Container.context.asAbsolutePath(
                    `resources/light/folder${iconSuffix}.svg`
                )
            )
        };

        item.command = this.getCommand();
        item.id = this.id;
        item.tooltip = tooltip;

        return item;
    }

    getCommand(): Command | undefined {
        const commandArgs: IWorkspaceCommandArgs = {
            workspace: this.workspace
        };
        return {
            title: `Switch To Workspace "${this.label}"`,
            command: Commands.SwitchToWorkspace,
            arguments: [commandArgs]
        };
    }

    async getChildren(): Promise<ViewNode[]> {
        if (!this._children) {
            const children: ViewNode[] = [];
            this._children = children;
        }

        return this._children;
    }

    async addToGroup() {
        await this.workspace.addToGroup();
        void this.parent!.triggerChange();
        void Container.refreshViews();
    }

    async moveToGroup() {
        await this.workspace.addToGroup();
        void this.parent!.triggerChange();
        void Container.refreshViews();
    }

    async addToFavorites() {
        await this.workspace.favorite();
        void this.parent!.triggerChange();
        void Container.refreshViews();
    }

    async removeFromFavorites() {
        await this.workspace.unfavorite();
        void this.parent!.triggerChange();
        void Container.refreshViews();
    }

    switchWorkspace() {
        this.workspace.switchWorkspace();
    }

    switchWorkspaceInNewWindow() {
        this.workspace.switchWorkspaceInNewWindow();
    }

    deleteWorkspace() {
        this.workspace.deleteWorkspace();
    }

    @Gate()
    @Debug()
    refresh() {
        this._children = undefined;
        void this.parent!.triggerChange();
    }
}
