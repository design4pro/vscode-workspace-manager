'use strict';

import { ExtensionContext } from 'vscode';
import { AbstractView } from './abstractView';

export enum Views {
    ActiveBar = 'workspaceManagerViewInActivityBar',
    Explorer = 'workspaceManagerViewInExplorer'
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

export function registerViews(context: ExtensionContext): void {
    for (const v of registrableViews) {
        context.subscriptions.push(new v());
    }
}
