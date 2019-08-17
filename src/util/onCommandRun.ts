import { ExecException } from 'child_process';
import * as vscode from 'vscode';

export function onCommandRun(
    err: ExecException | null,
    stdout: string,
    stderr: string
) {
    if (err || stderr) {
        vscode.window.showErrorMessage((err || { message: stderr }).message);
    }
}
