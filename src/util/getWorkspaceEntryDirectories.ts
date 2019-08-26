import { existsSync, statSync } from 'fs';
import { configuration } from '../configuration';
import { untildify } from './untildify';

export function getWorkspaceEntryDirectories(): string[] {
    let includeGlobPattern: string[] = configuration.get<string[]>(
        configuration.name('includeGlobPattern').value,
        null,
        []
    );

    if (!includeGlobPattern || !includeGlobPattern.length) {
        return [];
    }

    if (typeof includeGlobPattern === 'string') {
        includeGlobPattern = (<string>includeGlobPattern).split(',');
    }

    includeGlobPattern = includeGlobPattern
        .filter(p => typeof p === 'string')
        .map(p => untildify(p));

    if (!includeGlobPattern.length) {
        return [];
    }

    const pathsHash = includeGlobPattern.reduce(
        (acc: any, path) => ((acc[path] = true), acc),
        {}
    );

    const uniquePaths = Object.keys(pathsHash);

    const pathsAfterGlobbingHash = uniquePaths
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
