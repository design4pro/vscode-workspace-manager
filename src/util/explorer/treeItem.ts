import * as vscode from 'vscode';
import { ISwitchToWorkspaceCommandArgs } from '../../commands/workspace/switchToWorkspace';
import { WorkspaceEntry } from '../../model/workspace';

export class TreeItem extends vscode.TreeItem {
    public readonly label: string;

    constructor(public readonly workspaceEntry: WorkspaceEntry) {
        super(workspaceEntry.name, vscode.TreeItemCollapsibleState.None);

        this.label = workspaceEntry.name;
    }

    get description(): string {
        return '';
    }

    get tooltip(): string {
        return this.workspaceEntry.path;
    }

    get command(): vscode.Command {
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
