'use strict';

import * as vscode from 'vscode';
import { WorkspaceEntry } from '../../model/workspace';
import { gatherWorkspaceEntries } from '../../util/getWorkspaceEntries';
import { TreeItem } from './treeItem';

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
        const workspaceEntries = gatherWorkspaceEntries();

        const treeItems = workspaceEntries.reduce(
            (acc: TreeItem[], workspaceEntry: WorkspaceEntry) => (
                acc.push(new TreeItem(workspaceEntry)), acc
            ),
            []
        );

        return Promise.resolve(treeItems);
    }
}
