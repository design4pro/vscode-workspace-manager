import * as fs from 'fs';
import * as path from 'path';
import * as VError from 'verror';
import * as vscode from 'vscode';
import { extensionId } from '../constants';

export function getApp() {
    try {
        const key = `${
            vscode.env.appName.toLowerCase().search('insiders') !== -1
                ? 'codeInsiders'
                : 'code'
        }Executable`;
        const app = <string>(
            vscode.workspace.getConfiguration(extensionId).get(key)
        );

        if (app.search(/\s/) !== -1) {
            return `"${app}"`;
        }

        if (
            app === 'code' &&
            process.platform.toLocaleLowerCase().startsWith('win')
        ) {
            const codeWindowsScriptPath = path.join(
                path.dirname(process.execPath),
                'bin',
                'code.cmd'
            );

            if (
                fs.existsSync(codeWindowsScriptPath) &&
                fs.statSync(codeWindowsScriptPath).isFile()
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
