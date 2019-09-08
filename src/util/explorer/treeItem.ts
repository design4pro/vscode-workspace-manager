import * as vscode from 'vscode';
import { Container } from '../../container';
import { IWorkspaceCommandArgs, WorkspaceEntry } from '../../model/workspace';
import { ResourceType } from './treeDataProvider';

export class TreeItem extends vscode.TreeItem {
    public readonly label: string;

    constructor(public readonly workspaceEntry: WorkspaceEntry) {
        super(workspaceEntry.name, vscode.TreeItemCollapsibleState.None);

        this.label = workspaceEntry.name;
    }

    get id(): string {
        return `workspaceManager:worksapceEntry(${this.workspaceEntry.id})${
            this.favorite ? '+favorite' : ''
        }`;
    }

    get description(): string {
        return '';
    }

    get tooltip(): string {
        return `${this.workspaceEntry.name}\n${this.workspaceEntry.path}`;
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

        if (this.current) {
            contextValue += '+current';
        }

        if (this.favorite) {
            contextValue += '+favorite';
        }

        return contextValue;
    }

    get iconPath() {
        let iconSuffix = '';

        if (this.current) {
            iconSuffix += '-current';
        }

        if (this.favorite) {
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

    get favorite(): boolean {
        return !!this.workspaceEntry.favorite;
    }

    get current(): boolean {
        return !!this.workspaceEntry.current;
    }
}
