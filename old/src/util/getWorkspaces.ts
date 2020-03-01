import { Commands } from './../commands/common';
import * as glob from 'fast-glob';
import { join } from 'path';
import * as VError from 'verror';
import * as vscode from 'vscode';
import { Cache } from '../cache/cache';
import { configuration } from '../configuration';
import { CommandContext, extensionId, extensionOutputChannelName, setCommandContext } from '../constants';
import { Logger } from '../logger';
import { IWorkspace, Workspace } from '../model/workspace';
import { Container } from './../container';
import { getWorkspacesDirectories } from './getWorkspacesDirectories';
import { statusBarCache } from './statusBar/cache';

export async function getWorkspaces(fromCache: boolean = true): Promise<Workspace[] | undefined> {
    const cache = new Cache(extensionId);
    const cacheKey = 'workspaces';
    const cachedWorkspaces: IWorkspace[] | undefined = cache.get<IWorkspace[]>(cacheKey, []);

    if (fromCache && cachedWorkspaces && cachedWorkspaces.length && !cache.isExpired(cacheKey)) {
        setCommandContext(CommandContext.WorkspacesEmpty, false);

        return cachedWorkspaces.map(workspace => new Workspace(workspace));
    }

    const excludeGlobPattern: string[] = configuration.get<string[]>(
        configuration.name('advanced')('excludeGlobPattern').value,
        null,
        []
    );
    const deep: number = configuration.get<number>(configuration.name('advanced')('deep').value, null, 5);
    const directoryPaths = getWorkspacesDirectories();

    if (!directoryPaths.length) {
        // no directories set up
        const actions: vscode.MessageItem[] = [{ title: 'Setup Paths' }];

        const result = await vscode.window.showInformationMessage(
            "Workspace Manager doesn't have set up paths of directories where `.code-workspace` can be saved and then read from? Without that, the extension can't search for workspace configuration files.",
            ...actions
        );

        if (result != null) {
            if (result === actions[0]) {
                const userHome = process.env[process.platform == 'win32' ? 'USERPROFILE' : 'HOME'] || '~';

                const paths = await vscode.window.showInputBox({
                    placeHolder: `${userHome}/.vscode/, ${userHome}/projects/`,
                    value: undefined,
                    prompt:
                        'Paths of directories where `.code-workspace` files can be saved and then read from. You do not need to use `**/*` at the end. Use comma-separated directories. Try to not use root directories with too many files.'
                });

                if (paths && paths.length) {
                    await configuration.updateEffective(
                        'includeGlobPattern',
                        paths.split(',').map(path => path.trim())
                    );

                    setTimeout(() => vscode.commands.executeCommand(Commands.CacheWorkspace), 500);
                }
            }
        }

        return;
    }

    const directories = directoryPaths
        .map(dir => join(dir, '**/*.code-workspace'))
        .filter((path, index, arr) => arr.indexOf(path) == index);

    let workspaces: IWorkspace[] = [];
    let filesParsed: number = 0;
    let timeoutId: NodeJS.Timer;

    const addPath = async (path: string) => {
        if (path) {
            const workspaceConfiguration = await configuration.getWorkspaceConfiguration(path);

            if (workspaceConfiguration) {
                const rootPath = workspaceConfiguration.folders[0].path;
                const workspaceId = (<any>path)
                    .split('\\')
                    .pop()
                    .replace(/.code-workspace$/, '');

                const name = workspaceId.split('/').pop();

                const workspace: IWorkspace = {
                    id: workspaceId,
                    name,
                    path,
                    rootPath
                };

                workspaces.push(workspace);

                filesParsed++;

                statusBarCache.notify('eye', `Looking for workspaces... [${filesParsed}]`, false);
            }
        }
    };

    vscode.window.withProgress(
        {
            location: vscode.ProgressLocation.Notification,
            title: 'Looking for workspaces...',
            cancellable: false
        },
        async progress => {
            try {
                statusBarCache.notify('eye', 'Looking for workspaces...', false);

                const stream = glob.stream(directories, {
                    ignore: ['**/node_modules/**', ...excludeGlobPattern],
                    deep: deep,
                    onlyFiles: true
                });

                timeoutId = setTimeout(() => {
                    stream.pause();
                    Logger.info('Reading stream has been paused after 10s.');
                    vscode.window.showInformationMessage(
                        `${extensionOutputChannelName}\nReading stream has been paused after 10s.`
                    );
                }, 10000);

                for await (const entry of stream) {
                    if (entry && typeof entry === 'string') {
                        addPath(entry);
                    }
                }

                Logger.info(
                    `All the workspece files in the directories [${directories.join(', ')}] has been found [${
                        workspaces.length
                    }]`
                );

                workspaces.sort((a, b) => a.name.localeCompare(b.name));

                cache.update(cacheKey, workspaces);

                if (timeoutId) {
                    clearTimeout(timeoutId);
                }

                statusBarCache.notify('sync', 'Workspaces cached (click to cache again)');

                setCommandContext(CommandContext.WorkspacesEmpty, !!!workspaces.length);

                Container.refreshViews();

                return workspaces.map(workspace => new Workspace(workspace));
            } catch (err) {
                err = new VError(err, 'Reading stream has been destroyed');
                throw err;
            }
        }
    );
}
