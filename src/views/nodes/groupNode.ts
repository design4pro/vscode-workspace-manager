import * as uuid from 'uuid';
import { TreeItem, TreeItemCollapsibleState } from 'vscode';
import { Container } from '../../container';
import { WorkspaceEntry } from '../../model/workspace';
import { Debug } from '../../system';
import { GroupsView } from '../groupsView';
import { ResourceType, ViewNode } from './viewNode';
import { WorkspaceNode } from './workspaceNode';
import { View } from '../viewBase';

export class GroupNode extends ViewNode<View> {
    private _children: ViewNode[] | undefined;

    constructor(
        public readonly group: string | undefined,
        view: View,
        parent: ViewNode,
        public readonly workspaceEntries: WorkspaceEntry[]
    ) {
        super(group, view, parent);
    }

    get id(): string {
        const groupId = uuid();

        return `workspaceManager:group(${this.group || groupId})`;
    }

    async getChildren(): Promise<ViewNode[]> {
        if (this._children === undefined) {
            const children: WorkspaceNode[] = [];

            this.workspaceEntries.map(r => {
                if (this.group && this.group == r.group) {
                    children.push(
                        new WorkspaceNode(this.group, this.view, this, r)
                    );
                }
            });

            this._children = children;
        }

        return this._children;
    }

    async getTreeItem(): Promise<TreeItem> {
        const label = this.group || '';

        let description;
        let tooltip = `${label}`;
        let iconSuffix = '';

        const item = new TreeItem(label, TreeItemCollapsibleState.Expanded);
        item.contextValue = ResourceType.Group;

        item.iconPath = {
            dark: Container.context.asAbsolutePath(
                `images/dark/icon-repo${iconSuffix}.svg`
            ),
            light: Container.context.asAbsolutePath(
                `images/light/icon-repo${iconSuffix}.svg`
            )
        };

        item.id = this.id;
        item.tooltip = tooltip;

        return item;
    }

    @Debug()
    async refresh() {
        this._children = undefined;
    }
}
