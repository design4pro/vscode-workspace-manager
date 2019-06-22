'use strict';

import { Command, TreeItem, TreeItemCollapsibleState } from 'vscode';
import { WorkspaceEntry } from '../../model/workspace';
import { ISwitchToWorkspaceCommandArgs } from '../../commands/workspace/switchToWorkspace';

export class WorkspaceExplorerTreeItem extends TreeItem {
    public readonly label: string;

    constructor(public readonly workspaceEntry: WorkspaceEntry) {
        super(workspaceEntry.name, TreeItemCollapsibleState.None);

        this.label = workspaceEntry.name;
    }

    get description(): string {
        return '';
    }

    get tooltip(): string {
        return this.workspaceEntry.path;
    }

    get command(): Command {
        const args: ISwitchToWorkspaceCommandArgs = {
            workspaceEntry: this.workspaceEntry
        };

        return {
            title: `Switch To Workspace "${this.workspaceEntry.name}"`,
            command: 'workspaceManager.switchToWorkspace',
            arguments: [args]
        };
    }
}
