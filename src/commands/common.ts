import { ExtensionContext } from 'vscode';
import { AbstractCommand } from './abstractCommand';

export enum Commands {
    CacheWorkspace = 'workspaceManager.cacheWorkspace',
    CloseWorkspace = 'workspaceManager.closeWorkspace',
    SwitchWorkspace = 'workspaceManager.switchWorkspace'
}

interface CommandConstructor {
    new (): AbstractCommand;
}

export const registrableCommands: CommandConstructor[] = [];

export function Command(): ClassDecorator {
    return (target: any) => {
        console.log(target);
        registrableCommands.push(target);
        console.log(registrableCommands);
    };
}

export function registerCommands(context: ExtensionContext): void {
    console.log(registrableCommands);
    for (const c of registrableCommands) {
        context.subscriptions.push(new c());
    }
}
