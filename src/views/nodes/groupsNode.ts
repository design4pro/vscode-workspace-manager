import { TreeItem, TreeItemCollapsibleState } from 'vscode';
import { getWorkspaceEntries } from '../../util/getWorkspaceEntries';
import { GroupsView } from '../groupsView';
import { MessageNode } from './common';
import { GroupNode } from './groupNode';
import { ResourceType, ViewNode } from './viewNode';

export class GroupsNode extends ViewNode<GroupsView> {
    private _children: (GroupNode | MessageNode)[] | undefined;

    constructor(view: GroupsView) {
        super(undefined, view);
    }

    async getChildren(): Promise<ViewNode[]> {
        if (this._children === undefined) {
            const workspaceEntries = await getWorkspaceEntries();

            console.log(workspaceEntries);

            if (!workspaceEntries || workspaceEntries.length === 0) {
                return [
                    new MessageNode(
                        this.view,
                        this,
                        'No workspaces could be found.'
                    )
                ];
            }

            const groups: string[] = [];

            workspaceEntries.map(r => {
                if (r.group && !groups.includes(r.group)) {
                    groups.push(r.group);
                }
            });

            this._children = groups.map(
                r => new GroupNode(r, this.view, this, workspaceEntries)
            );

            if (this._children.length === 0) {
                return [
                    new MessageNode(
                        this.view,
                        this,
                        'No workspaces groups could be found.'
                    )
                ];
            }
        }

        return this._children;
    }

    getTreeItem(): TreeItem {
        const item = new TreeItem(
            'Workspaces',
            TreeItemCollapsibleState.Expanded
        );
        item.contextValue = ResourceType.Workspaces;

        return item;
    }

    async refresh(reset: boolean = false) {
        if (this._children === undefined) return;

        const workspaceEntries = await getWorkspaceEntries();

        if (
            !workspaceEntries ||
            (workspaceEntries.length === 0 &&
                (this._children === undefined || this._children.length === 0))
        ) {
            return;
        }

        if (workspaceEntries.length === 0) {
            this._children = [
                new MessageNode(
                    this.view,
                    this,
                    'No workspaces could be found.'
                )
            ];
            return;
        }

        const groups: string[] = [];

        workspaceEntries.map(r => {
            if (r.group && !groups.includes(r.group)) {
                groups.push(r.group);
            }
        });

        this._children = groups.map(
            r => new GroupNode(r, this.view, this, workspaceEntries)
        );
    }
}
