import { isEqual } from 'lodash';
import * as vscode from 'vscode';
import { configuration } from '../../configuration';
import { Workspace } from '../../model/workspace';
import { getWorkspaceByRootPath } from '../getWorkspaceByRootPath';
import { getWorkspaces } from '../getWorkspaces';
import { TreeItem } from './treeItem';

export enum ResourceType {
    Workspace = 'workspaceManager:Workspace'
}

class NoWorkspaces extends vscode.TreeItem {
    constructor() {
        super('No workspaces found', vscode.TreeItemCollapsibleState.None);
        this.contextValue = 'noscripts';
    }
}

export class TreeDataProvider implements vscode.TreeDataProvider<TreeItem> {
    private workspaceTree: TreeItem[] | NoWorkspaces[] | null = null;
    private _onDidChangeTreeData: vscode.EventEmitter<
        TreeItem | undefined
    > = new vscode.EventEmitter<TreeItem | undefined>();
    readonly onDidChangeTreeData: vscode.Event<TreeItem | undefined> = this
        ._onDidChangeTreeData.event;

    refresh(): void {
        this.workspaceTree = null;
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(treeItem: TreeItem): vscode.TreeItem {
        return treeItem;
    }

    async getChildren(): Promise<TreeItem[]> {
        if (!this.workspaceTree) {
            const workspaces = await getWorkspaces();
            const removeWorkspaceFromList: boolean = configuration.get(
                configuration.name('views')('removeCurrentWorkspaceFromList')
                    .value,
                null,
                true
            );

            if (workspaces && workspaces.length) {
                const currentWorkspace = await getWorkspaceByRootPath();

                this.workspaceTree = workspaces.reduce(
                    (acc: TreeItem[], workspace: Workspace) => {
                        const isCurrent = isEqual(workspace, currentWorkspace);
                        // workspace.current = isCurrent;

                        const item = new TreeItem(workspace);

                        if (isCurrent && removeWorkspaceFromList) {
                            return acc;
                        }

                        acc.push(item);

                        return acc;
                    },
                    []
                );
            } else {
                this.workspaceTree = [new NoWorkspaces()];
            }
        }

        if (this.workspaceTree) {
            return <TreeItem[]>this.workspaceTree;
        }

        return [];
    }
}
