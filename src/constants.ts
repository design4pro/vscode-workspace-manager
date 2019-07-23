'use strict';

import { commands } from 'vscode';

export const extensionId = 'workspace-manager';
export const extensionOutputChannelName = 'Workspace Manager';
export const extensionQualifiedId = `design4pro.${extensionId}`;
export const GlobalStateVersionKey = 'workspaceManagerVersion';
export const APPINSIGHTS_KEY = '842bc896-71b0-47ba-936e-c9f4c07e0c15';

export enum BuiltInCommands {
    SetContext = 'setContext'
}

export enum CommandContext {
    Enabled = 'workspace-manager:enabled',
    Empty = 'workspace-manager:empty',
    ViewInActivityBarShow = 'workspace-manager:viewInActivityBarShow',
    ViewInExplorerShow = 'workspace-manager:viewInExplorerShow'
}

export function setCommandContext(key: CommandContext | string, value: any) {
    return commands.executeCommand(BuiltInCommands.SetContext, key, value);
}
