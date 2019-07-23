'use strict';

import * as glob from 'fast-glob';
import { existsSync, statSync } from 'fs';
import { configuration } from '../configuration';

export function getWorkspaceEntryDirectories(): string[] {
    let includeGlobPattern: string[] = configuration.get<string[]>(
        configuration.name('includeGlobPattern').value,
        null,
        []
    );

    if (!includeGlobPattern || !includeGlobPattern.length) {
        return [];
    }

    const userHome =
        process.env[process.platform === 'win32' ? 'USERPROFILE' : 'HOME'] ||
        '~';

    includeGlobPattern = includeGlobPattern
        .filter(p => typeof p === 'string')
        .map(p => p.replace('~', userHome));

    if (!includeGlobPattern.length) {
        return [];
    }

    const pathsHash = includeGlobPattern.reduce(
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
