'use strict';

import { Event, EventEmitter, TreeDataProvider, TreeItem } from 'vscode';
import { WorkspaceEntry } from '../../model/workspace';
import { getWorkspaceEntries } from '../getWorkspaceEntries';
import { WorkspaceExplorerTreeItem } from './workspaceExplorerTreeItem';

export class WorkspaceExplorerTreeDataProvider
    implements TreeDataProvider<WorkspaceExplorerTreeItem> {
    private _onDidChangeTreeData: EventEmitter<
        WorkspaceExplorerTreeItem | undefined
    > = new EventEmitter<WorkspaceExplorerTreeItem | undefined>();
    readonly onDidChangeTreeData: Event<
        WorkspaceExplorerTreeItem | undefined
    > = this._onDidChangeTreeData.event;

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(treeItem: WorkspaceExplorerTreeItem): TreeItem {
        return treeItem;
    }

    async getChildren(
        element?: WorkspaceExplorerTreeItem
    ): Promise<WorkspaceExplorerTreeItem[]> {
        const workspaceEntries = await getWorkspaceEntries();

        const treeItems = workspaceEntries.reduce(
            (
                acc: WorkspaceExplorerTreeItem[],
                workspaceEntry: WorkspaceEntry
            ) => (acc.push(new WorkspaceExplorerTreeItem(workspaceEntry)), acc),
            []
        );

        return Promise.resolve(treeItems);
    }
}
