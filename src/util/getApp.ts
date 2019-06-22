'use strict';

import { existsSync, statSync } from 'fs';
import { dirname, join } from 'path';
import * as VError from 'verror';
import { env, workspace } from 'vscode';

export function getApp() {
    try {
        const key = `${
            env.appName.toLowerCase().search('insiders') !== -1
                ? 'codeInsiders'
                : 'code'
        }Executable`;
        const app = <string>(
            workspace.getConfiguration('workspace-manager').get(key)
        );

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
    } catch (err) {
        err = new VError(err, 'Can not find executable VSCode app');
        throw err;
    }
}
