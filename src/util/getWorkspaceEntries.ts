import * as glob from 'fast-glob';
import { join } from 'path';
import { readFile } from 'fs';
import * as VError from 'verror';
import * as vscode from 'vscode';
import { Cache } from '../cache/cache';
import { configuration } from '../configuration';
import { CommandContext, extensionId, setCommandContext } from '../constants';
import { Logger } from '../logger';
import { WorkspaceEntry } from '../model/workspace';
import { statusBarCache } from './statusBar/cache';
import { getWorkspaceEntryDirectories } from './getWorkspaceEntryDirectories';
import { Commands } from '../commands/common';
import { parse } from './json';

export async function getWorkspaceEntries(
    fromCache: boolean = true
): Promise<WorkspaceEntry[] | undefined> {
    const cache = new Cache(extensionId);
    const cacheKey = 'workspace-entries';
    const cachedEntries: WorkspaceEntry[] | undefined = cache.get<
        WorkspaceEntry[]
    >(cacheKey, []);

    if (
        fromCache &&
        cachedEntries &&
        cachedEntries.length &&
        !cache.isExpired(cacheKey)
    ) {
        setCommandContext(CommandContext.Empty, false);

        return await cachedEntries;
    }

    const excludeGlobPattern: string[] = configuration.get<string[]>(
        configuration.name('advanced')('excludeGlobPattern').value,
        null,
        []
    );
    const deep: number = configuration.get<number>(
        configuration.name('advanced')('deep').value,
        null,
        5
    );
    const directoryPaths = getWorkspaceEntryDirectories();

    const directories = directoryPaths
        .map(dir => join(dir, '**/*.code-workspace'))
        .filter((path, index, arr) => arr.indexOf(path) == index);

    let entries: WorkspaceEntry[] = [];
    let filesParsed: number = 0;
    let timeoutId: NodeJS.Timer;

    const addPath = (path: string) => {
        if (path) {
            readFile(path, (err: any, data) => {
                if (err) {
                    err = new VError(err, 'Reading stream error');
                    vscode.window.showInformationMessage(err);
                    throw err;
                }

                const content = parse(data.toString());
                const rootPath = content.folders[0].path;

                const isFavorite = !!content.settings[
                    'workspace-manager.workspace.favorite'
                ];

                const name = (<any>path)
                    .split('\\')
                    .pop()
                    .split('/')
                    .pop()
                    .replace(/.code-workspace$/, '');

                entries.push({
                    name,
                    path,
                    rootPath
                });

                filesParsed++;

                statusBarCache.notify(
                    'eye',
                    `Looking for workspace entries... [${filesParsed}]`,
                    false
                );
            });
        }
    };

    try {
        statusBarCache.notify('eye', 'Looking for workspace entries...', false);

        const stream = glob.stream(directories, {
            ignore: ['**/node_modules/**', ...excludeGlobPattern],
            deep: deep,
            onlyFiles: true
        });

        const onEnd = () => {
            Logger.info(
                `All the workspece files in the directories [${directories.join(
                    ', '
                )}] has been found [${entries.length}]`
            );

            entries.sort((a, b) => a.name.localeCompare(b.name));

            cache.update(cacheKey, entries);

            if (timeoutId) {
                clearTimeout(timeoutId);
            }

            statusBarCache.notify(
                'sync',
                'Workspace entries cached (click to cache again)'
            );

            setCommandContext(CommandContext.Empty, !!!entries.length);

            vscode.commands.executeCommand(Commands.RefreshTreeData);

            return entries;
        };

        stream
            .on('data', (path: string) => {
                statusBarCache.notify(
                    'eye',
                    `Looking for workspace entries... [${entries.length}]`,
                    false
                );
                addPath(path);
            })
            .on('error', err => {
                err = new VError(err, 'Reading stream error');
                vscode.window.showInformationMessage(err);
                throw err;
            })
            .on('pause', onEnd)
            .on('end', onEnd)
            .on('close', () => {
                Logger.info(
                    'Stream has been destroyed and file has been closed'
                );
            });

        timeoutId = setTimeout(() => {
            stream.pause();
            Logger.info('Reading stream has been poused after 10s.');
            vscode.window.showInformationMessage(
                'Reading stream has been poused after 10s.'
            );
        }, 10000);
    } catch (err) {
        err = new VError(err, 'Reading stream has been destroyed');
        throw err;
    }
}
