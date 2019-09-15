import { TreeItem, TreeItemCollapsibleState } from 'vscode';
import { getWorkspaces } from '../../util/getWorkspaces';
import { GroupsView } from '../groupsView';
import { MessageNode } from './common';
import { GroupNode } from './groupNode';
import { ResourceType, ViewNode } from './viewNode';

export class GroupsNode extends ViewNode<GroupsView> {
    private _children: (GroupNode | MessageNode)[] | undefined;

    constructor(view: GroupsView) {
        super(view);
    }

    async getChildren(): Promise<ViewNode[]> {
        if (this._children === undefined) {
            this._children = await this.getGroups();
        }

        if (!this._children || this._children.length === 0) {
            return [
                new MessageNode(
                    this.view,
                    this,
                    'No workspaces groups could be found.'
                )
            ];
        }

        return this._children;
    }

    getTreeItem(): TreeItem {
        const item = new TreeItem('Groups', TreeItemCollapsibleState.Expanded);
        item.contextValue = ResourceType.Workspaces;

        return item;
    }

    async refresh() {
        if (this._children === undefined) return;

        this._children = await this.getGroups();
    }

    private async getGroups() {
        const workspaces = await getWorkspaces();

        if (!workspaces || workspaces.length === 0) {
            return [
                new MessageNode(
                    this.view,
                    this,
                    'No workspaces groups could be found.'
                )
            ];
        }

        const groups: string[] = [];

        workspaces.map(r => {
            if (r.group && !groups.includes(r.group)) {
                groups.push(r.group);
            }
        });

        console.log(groups);

        return groups.map(r => new GroupNode(r, this.view, this, workspaces));
    }
}
