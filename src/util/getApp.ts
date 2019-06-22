'use strict';

import { existsSync, statSync } from 'fs';
import { dirname, join } from 'path';
import { env, workspace } from 'vscode';

export function getApp() {
    const key = `${
        env.appName.toLowerCase().search('insiders') !== -1
            ? 'codeInsiders'
            : 'code'
    }Executable`;
    const app = <string>workspace.getConfiguration('workspaceManager').get(key);

    if (app.search(/\s/) !== -1) {
        return `"${app}"`;
    }

    if (
        app === 'code' &&
        process.platform.toLocaleLowerCase().startsWith('win')
    ) {
        const codeWindowsScriptPath = join(
            dirname(process.execPath),
            'bin',
            'code.cmd'
        );

        if (
            existsSync(codeWindowsScriptPath) &&
            statSync(codeWindowsScriptPath).isFile()
        ) {
            return `"${codeWindowsScriptPath}"`;
        }
    }

    return app;
}
