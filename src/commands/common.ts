import * as vscode from 'vscode';
import { AbstractCommand } from './abstractCommand';

export enum Commands {
    RefreshTreeData = 'workspaceManager.refreshTreeData',
    AddToFavorites = 'workspaceManager.addToFavorites',
    CacheWorkspace = 'workspaceManager.cacheWorkspace',
    CloseWorkspace = 'workspaceManager.closeWorkspace',
    DeleteWorkspace = 'workspaceManager.deleteWorkspace',
    OpenWorkspaceSettings = 'workspaceManager.openWorkspaceSettings',
    SaveWorkspace = 'workspaceManager.saveWorkspace',
    SwitchWorkspace = 'workspaceManager.switchWorkspace',
    SwitchToWorkspace = 'workspaceManager.switchToWorkspace',
    SwitchWorkspaceInNewWindow = 'workspaceManager.switchWorkspaceInNewWindow'
}

interface CommandConstructor {
    new (): AbstractCommand;
}

export const registrableCommands: CommandConstructor[] = [];

export function Command(): ClassDecorator {
    return (target: any) => {
        registrableCommands.push(target);
    };
}

export function registerCommands(context: vscode.ExtensionContext): void {
    for (const c of registrableCommands) {
        context.subscriptions.push(new c());
    }
}
