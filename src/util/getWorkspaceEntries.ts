'use strict';

import * as glob from 'fast-glob';
import * as VError from 'verror';
import { WorkspaceEntry } from '../model/workspace';
import { getWorkspaceEntryDirectories } from './getWorkspaceEntryDirectories';
import { workspace, window } from 'vscode';
import { Cache } from '../cache/cache';
import { Logger } from '../logger';
import { notifier } from '../extension';

export async function getWorkspaceEntries(
    fromCache: boolean = true
): Promise<WorkspaceEntry[]> {
    const cache = new Cache();
    const cacheKey = 'workspace-entries';
    const cachedEntries: WorkspaceEntry[] = cache.get<WorkspaceEntry[]>(
        cacheKey,
        []
    );

    if (
        fromCache &&
        cachedEntries &&
        cachedEntries.length &&
        !cache.isExpired(cacheKey)
    ) {
        return await cachedEntries;
    }

    const configuration = workspace.getConfiguration();
    const excludeGlobPattern: string[] = configuration.get(
        'workspace-manager.excludeGlobPattern'
    );
    const directoryPaths = getWorkspaceEntryDirectories();

    const directories = directoryPaths.map(dir => `${dir}**/*.code-workspace`);

    let entries: WorkspaceEntry[] = [];
    let filesParsed: number = 0;
    let timeoutId: NodeJS.Timer;

    const addPath = (path: string) => {
        entries.push({
            name: path
                .split('\\')
                .pop()
                .split('/')
                .pop()
                .replace(/.code-workspace$/, ''),
            path: path
        });

        filesParsed++;

        notifier.notify(
            'eye',
            `Looking for workspace entries... [${filesParsed}]`,
            false
        );
    };

    try {
        notifier.notify('eye', 'Looking for workspace entries...', false);

        const stream = glob.stream(directories, {
            ignore: ['**/node_modules/**', ...excludeGlobPattern],
            onlyFiles: true
        });

        await stream
            .on('data', path => {
                notifier.notify(
                    'eye',
                    `Looking for workspace entries... [${entries.length}]`,
                    false
                );
                addPath(path);
            })
            .on('error', err => {
                err = new VError(err, 'Reading stream error');
                throw err;
            })
            .on('end', () => {
                Logger.info(
                    `All the workspece files in the directories [${directories.join(
                        ', '
                    )}] has been found`
                );

                entries.sort((a, b) => a.name.localeCompare(b.name));

                cache.update(cacheKey, entries);

                if (timeoutId) {
                    clearTimeout(timeoutId);
                }

                notifier.notify(
                    'file-submodule',
                    'Workspace entries cached (click to cache again)'
                );

                return entries;
            })
            .on('close', () => {
                Logger.info(
                    'Stream has been destroyed and file has been closed'
                );
            });

        timeoutId = setTimeout(() => {
            stream.pause();
            Logger.info('Reading stream has been poused after 60s.');
        }, 60000);
    } catch (err) {
        err = new VError(err, 'Reading stream has been destroyed');
        throw err;
    }
}
