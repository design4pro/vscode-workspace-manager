import * as vscode from 'vscode';
import { Container } from '../../container';
import { IWorkspaceCommandArgs, Workspace } from '../../model/workspace';
import { ResourceType } from './treeDataProvider';

export class TreeItem extends vscode.TreeItem {
    public readonly label: string;

    constructor(public readonly workspace: Workspace) {
        super(workspace.getName, vscode.TreeItemCollapsibleState.None);

        this.label = workspace.getName;
    }

    get id(): string {
        return `workspaceManager:worksapceEntry(${this.workspace.id})${
            this.favorite ? '+favorite' : ''
        }`;
    }

    get description(): string {
        return '';
    }

    get tooltip(): string {
        return `${this.workspace.getName}\n${this.workspace.getPath}`;
    }

    get command(): vscode.Command {
        const args: IWorkspaceCommandArgs = {
            workspace: this.workspace
        };

        return {
            title: `Switch To Workspace "${this.workspace.getName}"`,
            command: 'workspaceManager.switchToWorkspace',
            arguments: [args]
        };
    }

    get contextValue() {
        let contextValue: string = ResourceType.Workspace;

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
        return !!this.workspace.favorite;
    }

    get current(): boolean {
        return false; //!!this.workspace.current;
    }
}
