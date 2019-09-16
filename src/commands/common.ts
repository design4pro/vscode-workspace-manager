import * as vscode from 'vscode';
import { AbstractCommand } from './abstractCommand';

export enum Commands {
    AddToFavorites = 'workspaceManager.addToFavorites',
    AddToGroup = 'workspaceManager.addToGroup',
    CacheWorkspace = 'workspaceManager.cacheWorkspace',
    CloseWorkspace = 'workspaceManager.closeWorkspace',
    DeleteWorkspace = 'workspaceManager.deleteWorkspace',
    MoveToGroup = 'workspaceManager.moveToGroup',
    OpenWorkspaceSettings = 'workspaceManager.openWorkspaceSettings',
    RemoveFromFavorites = 'workspaceManager.removeFromFavorites',
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
