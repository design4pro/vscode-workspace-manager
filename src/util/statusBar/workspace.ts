import { debounce } from 'lodash';
import * as vscode from 'vscode';
import { configuration } from '../../configuration';
import { getActiveRootPath } from '../getPath';
import { getWorkspaceByRootPath } from '../getWorkspace';
import { Commands } from './../../commands/common';

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

        if (!this.canShow) {
            this.statusBarItem.hide();

            return;
        }

        if (workspace) {
            this.statusBarItem.text = workspace.name;
            this.statusBarItem.tooltip = workspace.path;
        } else {
            this.statusBarItem.text = 'No workspace opened';
        }

        const openInNewWindow: boolean = configuration.get(
            configuration.name('openInNewWindowWhenClickingInStatusBar').value,
            null,
            true
        );

        if (openInNewWindow) {
            this.statusBarItem.command = Commands.SwitchWorkspaceInNewWindow;
        }

        this.statusBarItem.show();
    }

    toggle() {
        if (!this.canShow) {
            this.statusBarItem.hide();
        } else {
            this.statusBarItem.show();
        }
    }

    get canShow(): boolean {
        return configuration.get(
            configuration.name('view')('showWorkspaceNameInStatusBar').value,
            null,
            true
        );
    }
}

export const statusBarWorkspace: StatusBarWorkspace = new StatusBarWorkspace();
