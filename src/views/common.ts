import * as vscode from 'vscode';
import { AbstractView } from './abstractView';

export enum Views {
    ActiveBar = 'workspaceManager.views.workspaceManager',
    Explorer = 'workspaceManager.views.explorer'
}

export enum ViewsCommands {
    ActiveBarRefresh = 'workspaceManager.views.workspaceManager.refresh',
    ExplorerRefresh = 'workspaceManager.views.explorer.refresh'
}

interface ViewConstructor {
    new (): AbstractView;
}

export const registrableViews: ViewConstructor[] = [];

export function View(): ClassDecorator {
    return (target: any) => {
        registrableViews.push(target);
    };
}

export function registerViews(context: vscode.ExtensionContext): void {
    for (const v of registrableViews) {
        context.subscriptions.push(new v());
    }
}
