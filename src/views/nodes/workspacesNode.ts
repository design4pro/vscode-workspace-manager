import { isEqual } from 'lodash';
import { TreeItem, TreeItemCollapsibleState } from 'vscode';
import { configuration } from '../../configuration';
import { WorkspaceEntry } from '../../model/workspace';
import { getWorkspaceByRootPath } from '../../util/getWorkspace';
import { getWorkspaceEntries } from '../../util/getWorkspaceEntries';
import { WorkspacesView } from '../workspacesView';
import { MessageNode } from './common';
import { ResourceType, ViewNode } from './viewNode';
import { WorkspaceNode } from './workspaceNode';

export class WorkspacesNode extends ViewNode<WorkspacesView> {
    private _children: (WorkspaceNode | MessageNode)[] | undefined;

    constructor(view: WorkspacesView) {
        super(undefined, view);
    }

    async getChildren(): Promise<ViewNode[]> {
        if (this._children === undefined) {
            const workspaceEntries = await this.getWorkspaces();

            this._children = workspaceEntries;
        }

        return this._children;
    }

    getTreeItem(): TreeItem {
        const item = new TreeItem('Workspaces', TreeItemCollapsibleState.None);
        item.contextValue = ResourceType.Workspaces;

        return item;
    }

    async refresh(reset: boolean = false) {
        if (this._children === undefined) return;

        const workspaceEntries = await this.getWorkspaces();

        this._children = workspaceEntries;
    }

    private async getWorkspaces() {
        const workspaceEntries = await getWorkspaceEntries();

        const removeWorkspaceFromList: boolean = configuration.get(
            configuration.name('views')('removeCurrentWorkspaceFromList').value,
            null,
            true
        );

        if (!workspaceEntries || workspaceEntries.length === 0) {
            return [
                new MessageNode(
                    this.view,
                    this,
                    'No workspaces could be found.'
                )
            ];
        }

        const currentWorkspace = await getWorkspaceByRootPath();

        return workspaceEntries.reduce(
            (acc: WorkspaceNode[], workspaceEntry: WorkspaceEntry) => {
                const isCurrent = isEqual(workspaceEntry, currentWorkspace);
                workspaceEntry.current = isCurrent;

                const item = new WorkspaceNode(
                    workspaceEntry.group,
                    this.view,
                    this,
                    workspaceEntry
                );

                if (isCurrent && removeWorkspaceFromList) {
                    return acc;
                }

                acc.push(item);

                return acc;
            },
            []
        );
    }
}
