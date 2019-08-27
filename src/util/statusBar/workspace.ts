import { debounce } from 'lodash';
import * as vscode from 'vscode';
import { Commands } from '../../commands/common';
import { getActiveRootPath } from '../getPath';
import { getWorkspaceByRootPath } from '../getWorkspace';

export class StatusBarWorkspace {
    statusBarItem: vscode.StatusBarItem;
    notifyDebounced = debounce(this.notify.bind(this), 100);

    constructor(
        command: string = Commands.SwitchWorkspace,
        alignment?: vscode.StatusBarAlignment,
        priority: number = -1
    ) {
        this.statusBarItem = vscode.window.createStatusBarItem(
            alignment,
            priority
        );

        vscode.workspace.onDidChangeConfiguration(() => this.notifyDebounced());
        vscode.window.onDidChangeActiveTextEditor(() => this.notifyDebounced());

        this.statusBarItem.command = command;
    }

    async notify() {
        const rootPath = getActiveRootPath();
        const workspace = await getWorkspaceByRootPath(<string>rootPath);

        if (!workspace) {
            return;
        }

        this.statusBarItem.show();
        this.statusBarItem.text = workspace.name;
        this.statusBarItem.tooltip = workspace.path || 'No workspace opened';
    }
}

export const statusBarWorkspace: StatusBarWorkspace = new StatusBarWorkspace();
