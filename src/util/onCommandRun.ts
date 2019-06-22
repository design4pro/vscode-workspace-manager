'use strict';

import { ExecException } from 'child_process';
import { window } from 'vscode';

export function onCommandRun(
    err: ExecException | null,
    stdout: string,
    stderr: string
) {
    if (err || stderr) {
        window.showErrorMessage((err || { message: stderr }).message);
    }
}
