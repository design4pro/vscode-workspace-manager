import * as uuid from 'uuid';
import { TreeItem, TreeItemCollapsibleState } from 'vscode';
import { Workspace } from '../../model/workspace';
import { Debug } from '../../system';
import { GroupsView } from '../groupsView';
import { ResourceType, ViewNode } from './viewNode';
import { WorkspaceNode } from './workspaceNode';

export class GroupNode extends ViewNode<GroupsView> {
    private _children: ViewNode[] | undefined;

    constructor(
        public readonly group: string | undefined,
        view: GroupsView,
        parent: ViewNode,
        public readonly workspaces: Workspace[]
    ) {
        super(view, parent);
    }

    get id(): string {
        const id = uuid();

        return `workspaceManager:group(${this.group || id})`;
    }

    async getChildren(): Promise<ViewNode[]> {
        if (this._children === undefined) {
            const children: WorkspaceNode[] = [];

            this.workspaces.map(r => {
                if (this.group && this.group == r.group) {
                    children.push(new WorkspaceNode(this.view, this, r));
                }
            });

            this._children = children;
        }

        return this._children;
    }

    async getTreeItem(): Promise<TreeItem> {
        const label = this.group || '';

        let tooltip = `${label}`;

        const item = new TreeItem(label, TreeItemCollapsibleState.Expanded);
        item.contextValue = ResourceType.Group;

        item.id = this.id;
        item.tooltip = tooltip;

        return item;
    }

    @Debug()
    async refresh() {
        this._children = undefined;
        void this.parent!.triggerChange();
    }
}
