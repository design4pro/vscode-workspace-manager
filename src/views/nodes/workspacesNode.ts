import { isEqual } from 'lodash';
import { TreeItem, TreeItemCollapsibleState } from 'vscode';
import { configuration } from '../../configuration';
import { Workspace } from '../../model/workspace';
import { getWorkspaceByRootPath } from '../../util/getWorkspaceByRootPath';
import { getWorkspaces } from '../../util/getWorkspaces';
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
            const workspaces = await this.getWorkspaces();

            this._children = workspaces;
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

        const workspaces = await this.getWorkspaces();

        this._children = workspaces;
    }

    private async getWorkspaces() {
        const workspaces = await getWorkspaces();

        const removeWorkspaceFromList: boolean = configuration.get(
            configuration.name('views')('removeCurrentWorkspaceFromList').value,
            null,
            true
        );

        if (!workspaces || workspaces.length === 0) {
            return [
                new MessageNode(
                    this.view,
                    this,
                    'No workspaces could be found.'
                )
            ];
        }

        const currentWorkspace = await getWorkspaceByRootPath();

        return workspaces.reduce(
            (acc: WorkspaceNode[], workspace: Workspace) => {
                const isCurrent = isEqual(workspace, currentWorkspace);
                // workspace.current = isCurrent;

                const item = new WorkspaceNode(
                    workspace.group,
                    this.view,
                    this,
                    workspace
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
