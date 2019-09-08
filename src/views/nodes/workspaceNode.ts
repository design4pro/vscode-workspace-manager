import * as uuid from 'uuid';
import { commands, TreeItem, TreeItemCollapsibleState, Command } from 'vscode';
import { Commands } from '../../commands/common';
import { Container } from '../../container';
import { WorkspaceEntry, IWorkspaceCommandArgs } from '../../model/workspace';
import { View } from '../viewBase';
import { PageableViewNode, ResourceType, ViewNode } from './viewNode';

export class WorkspaceNode extends ViewNode<View> implements PageableViewNode {
    readonly supportsPaging = true;
    readonly rememberLastMaxCount = true;
    maxCount: number | undefined = this.view.getNodeLastMaxCount(this);

    private _children: ViewNode[] | undefined;

    constructor(
        public readonly group: string | undefined,
        view: View,
        parent: ViewNode,
        public readonly workspace: WorkspaceEntry,
        // Specifies that the node is shown as a root under the repository node
        private readonly _root: boolean = false
    ) {
        super(group, view, parent);
    }

    get id(): string {
        const groupId = uuid();

        return `workspaceManager:group(${this.group || groupId})${
            this._root ? ':root' : ''
        }:workspace(${this.workspace.name})${
            this.workspace.current ? '+current' : ''
        }${this.workspace.favorite ? '+favorite' : ''}`;
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

        if (this.workspace.favorite) {
            item.contextValue += '+favorite';
            iconSuffix += '-favorite';
        }

        item.description = description;
        item.iconPath = {
            dark: Container.context.asAbsolutePath(
                `resources/dark/folder${iconSuffix}.svg`
            ),
            light: Container.context.asAbsolutePath(
                `resources/light/folder${iconSuffix}.svg`
            )
        };

        item.command = this.getCommand();
        item.id = this.id;
        item.tooltip = tooltip;

        return item;
    }

    getCommand(): Command | undefined {
        const commandArgs: IWorkspaceCommandArgs = {
            workspaceEntry: this.workspace
        };
        return {
            title: `Switch To Workspace "${this.label}"`,
            command: 'workspaceManager.switchToWorkspace',
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

    async addToFavorites() {
        await commands.executeCommand(Commands.AddToFavorites, {
            workspaceEntry: this.workspace
        });
        void this.parent!.triggerChange();
    }

    async removeFromFavorites() {
        await commands.executeCommand(Commands.RemoveFromFavorites, {
            workspaceEntry: this.workspace
        });
        void this.parent!.triggerChange();
    }

    refresh() {
        this._children = undefined;
    }
}
