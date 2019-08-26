import * as vscode from 'vscode';
import { WorkspaceEntry } from '../../model/workspace';
import { getWorkspaceEntries } from '../getWorkspaceEntries';
import { TreeItem } from './treeItem';

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
            const workspaceEntries = await getWorkspaceEntries();

            if (workspaceEntries && workspaceEntries.length) {
                this.workspaceTree = workspaceEntries.reduce(
                    (acc: TreeItem[], workspaceEntry: WorkspaceEntry) => (
                        acc.push(new TreeItem(workspaceEntry)), acc
                    ),
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
