import { ExtensionContext } from 'vscode';
import { AbstractCommand } from './abstractCommand';
import { extensionId } from '../constants';

export enum Commands {
    CloseWorkspace = 'vscode-workspace-manager.closeWorkspace'
}

interface CommandConstructor {
    new (): AbstractCommand;
}

const registrableCommands: CommandConstructor[] = [];

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
