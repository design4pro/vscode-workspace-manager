import * as vscode from 'vscode';
import * as util from '../../util';
import { TreeItem } from './treeItem';
import { WorkspaceEntry } from '../../model/workspaceEntry';

export class TreeDataProvider implements vscode.TreeDataProvider<TreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<
        TreeItem | undefined
    > = new vscode.EventEmitter<TreeItem | undefined>();
    readonly onDidChangeTreeData: vscode.Event<TreeItem | undefined> = this
        ._onDidChangeTreeData.event;

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(treeItem: TreeItem): vscode.TreeItem {
        return treeItem;
    }

    getChildren(element?: TreeItem): Thenable<TreeItem[]> {
        const workspaceEntries = util.gatherWorkspaceEntries();
        const reducer = (acc: TreeItem[], workspaceEntry: WorkspaceEntry) => (
            acc.push(new TreeItem(workspaceEntry)), acc
        );
        let treeItems = workspaceEntries.reduce(reducer, []);

        return Promise.resolve(treeItems);
    }
}
