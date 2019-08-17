import * as vscode from 'vscode';

export class Notifier {
    statusBarItem: vscode.StatusBarItem;
    private timeoutId?: NodeJS.Timer;

    constructor(
        command?: string,
        alignment?: vscode.StatusBarAlignment,
        priority?: number
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

        this.statusBarItem.show();
        this.statusBarItem.text = `$(${icon}) ${text}`;
        this.statusBarItem.tooltip = undefined;

        if (autoHide) {
            this.timeoutId = setTimeout(() => {
                this.statusBarItem.text = `$(${icon})`;
                this.statusBarItem.tooltip = text;
            }, 5000);
        }
    }
}
