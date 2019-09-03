import * as vscode from 'vscode';
import { isEqual } from 'lodash';
import { WorkspaceEntry } from '../../model/workspace';
import { getWorkspaceEntries } from '../getWorkspaceEntries';
import { TreeItem } from './treeItem';
import { configuration } from '../../configuration';
import { getActiveRootPath } from '../getPath';
import { getWorkspaceByRootPath } from '../getWorkspace';
import { Container } from '../../container';

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
            const removeWorkspaceFromList: boolean = configuration.get(
                configuration.name('view')('removeCurrentWorkspaceFromList')
                    .value,
                null,
                true
            );

            if (workspaceEntries && workspaceEntries.length) {
                const rootPath = getActiveRootPath();
                const activeWorkspace = await getWorkspaceByRootPath(<string>(
                    rootPath
                ));

                this.workspaceTree = workspaceEntries.reduce(
                    (acc: TreeItem[], workspaceEntry: WorkspaceEntry) => {
                        const isActive = isEqual(
                            workspaceEntry,
                            activeWorkspace
                        );
                        const item = new TreeItem(workspaceEntry);

                        if (isActive) {
                            item.iconPath = {
                                dark: Container.context.asAbsolutePath(
                                    'resources/dark/folder-active.svg'
                                ),
                                light: Container.context.asAbsolutePath(
                                    'resources/light/folder-active.svg'
                                )
                            };
                        } else {
                            item.iconPath = {
                                dark: Container.context.asAbsolutePath(
                                    'resources/dark/folder.svg'
                                ),
                                light: Container.context.asAbsolutePath(
                                    'resources/light/folder.svg'
                                )
                            };
                        }

                        if (isActive && removeWorkspaceFromList) {
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
