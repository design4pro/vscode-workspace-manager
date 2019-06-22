import { StatusBarItem, window, StatusBarAlignment } from 'vscode';

export class Notifier {
    statusBarItem: StatusBarItem;
    private timeoutId: NodeJS.Timer;

    constructor(
        command?: string,
        alignment?: StatusBarAlignment,
        priority?: number
    ) {
        this.statusBarItem = window.createStatusBarItem(alignment, priority);
        this.statusBarItem.command = command;
        this.statusBarItem.show();
    }

    notify(icon: string, text: string, autoHide: boolean = true): void {
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
        }

        this.statusBarItem.text = `$(${icon}) ${text}`;
        this.statusBarItem.tooltip = null;

        if (autoHide) {
            this.timeoutId = setTimeout(() => {
                this.statusBarItem.text = `$(${icon})`;
                this.statusBarItem.tooltip = text;
            }, 5000);
        }
    }
}
