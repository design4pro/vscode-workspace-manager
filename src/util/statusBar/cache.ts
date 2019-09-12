import * as vscode from 'vscode';
import { Commands } from '../../commands/common';
import { configuration } from '../../configuration';

export class StatusBarCache {
    statusBarItem: vscode.StatusBarItem;
    private timeoutId?: NodeJS.Timer;

    constructor(
        command: string = Commands.CacheWorkspace,
        alignment?: vscode.StatusBarAlignment,
        priority: number = 0
    ) {
        this.statusBarItem = vscode.window.createStatusBarItem(
            alignment,
            priority
        );
        this.statusBarItem.command = command;
    }

    notify(icon: string, text: string, autoHide: boolean = true): void {
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
        }

        if (!this.canShow) {
            this.statusBarItem.hide();

            return;
        }

        this.statusBarItem.text = `$(${icon}) ${text}`;
        this.statusBarItem.tooltip = undefined;

        if (autoHide) {
            this.timeoutId = setTimeout(() => {
                this.statusBarItem.text = `$(${icon})`;
                this.statusBarItem.tooltip = text;
            }, 5000);
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
            configuration.name('views')('showWorkspaceRefreshIconInStatusBar')
                .value,
            null,
            true
        );
    }
}

export const statusBarCache: StatusBarCache = new StatusBarCache();
