'use strict';

import { ExtensionContext } from 'vscode';
import { AbstractCommand } from './abstractCommand';

export enum Commands {
    CacheWorkspace = 'workspaceManager.cacheWorkspace',
    CloseWorkspace = 'workspaceManager.closeWorkspace',
    SwitchWorkspace = 'workspaceManager.switchWorkspace',
    SwitchToWorkspace = 'workspaceManager.switchToWorkspace'
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

export function registerCommands(context: ExtensionContext): void {
    for (const c of registrableCommands) {
        context.subscriptions.push(new c());
    }
}
