import * as glob from 'fast-glob';
import { existsSync, statSync } from 'fs';
import * as vscode from 'vscode';

export function getWorkspaceEntryDirectories(): string[] {
    let paths = vscode.workspace
        .getConfiguration('vscodeWorkspaceManager')
        .get('paths') as string[];

    if (!paths || !paths.length) {
        return [];
    }

    const userHome =
        process.env[process.platform === 'win32' ? 'USERPROFILE' : 'HOME'] ||
        '~';

    paths = paths
        .filter(p => typeof p === 'string')
        .map(p => p.replace('~', userHome));

    if (!paths.length) {
        return [];
    }

    const pathsHash = paths.reduce(
        (acc: any, path) => ((acc[path] = true), acc),
        {}
    );

    const uniquePaths = Object.keys(pathsHash);

    const pathsAfterGlobbingHash = uniquePaths
        .map(p => {
            try {
                return glob.sync<string>([p], {
                    cwd: '/',
                    onlyDirectories: true,
                    absolute: true
                });
            } catch (err) {
                return [];
            }
        })
        .reduce((acc, val) => acc.concat(val), [])
        .concat(uniquePaths.map(p => p.replace(/(:?\*\*?\/?)+$/, '')))
        .filter(p => {
            try {
                return existsSync(p) && statSync(p).isDirectory();
            } catch (err) {
                return false;
            }
        })
        .reduce((acc: any, path: string) => ((acc[path] = true), acc), {});

    return Object.keys(pathsAfterGlobbingHash).sort();
}
