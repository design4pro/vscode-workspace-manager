import * as vscode from 'vscode';
import { IWorkspaceCommandArgs, WorkspaceEntry } from '../../model/workspace';
import { ResourceType } from './treeDataProvider';
import { Container } from '../../container';

export class TreeItem extends vscode.TreeItem {
    public readonly label: string;

    constructor(
        public readonly workspaceEntry: WorkspaceEntry,
        public readonly active?: boolean
    ) {
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
        const args: IWorkspaceCommandArgs = {
            workspaceEntry: this.workspaceEntry
        };

        return {
            title: `Switch To Workspace "${this.workspaceEntry.name}"`,
            command: 'workspaceManager.switchToWorkspace',
            arguments: [args]
        };
    }

    get contextValue() {
        let contextValue: string = ResourceType.WorkspaceEntry;

        if (this.active) {
            contextValue += '+active';
        }

        if (this.workspaceEntry.isFavorite) {
            contextValue += '+favorite';
        }

        return contextValue;
    }

    get iconPath() {
        let iconSuffix = '';

        if (this.active) {
            iconSuffix += '-active';
        }

        if (this.workspaceEntry.isFavorite) {
            iconSuffix += '-favorite';
        }

        return {
            dark: Container.context.asAbsolutePath(
                `resources/dark/folder${iconSuffix}.svg`
            ),
            light: Container.context.asAbsolutePath(
                `resources/light/folder${iconSuffix}.svg`
            )
        };
    }
}
