'use strict';

import * as glob from 'fast-glob';
import { WorkspaceEntry } from '../model/workspace';
import { getWorkspaceEntryDirectories } from './getWorkspaceEntryDirectories';

export async function gatherWorkspaceEntries(): Promise<WorkspaceEntry[]> {
    const directoryPaths = getWorkspaceEntryDirectories();

    return await (<WorkspaceEntry[]>directoryPaths.reduce(
        (acc: WorkspaceEntry[], dir: string) => {
            try {
                return glob
                    .sync<string>('**/*.code-workspace', {
                        cwd: dir,
                        absolute: true,
                        onlyFiles: true,
                        unique: true,
                        deep: 2
                    })
                    .reduce((accProxy: WorkspaceEntry[], path: string) => {
                        accProxy.push({
                            name: path
                                .split('\\')
                                .pop()
                                .split('/')
                                .pop()
                                .replace(/.code-workspace$/, ''),
                            path: path
                        });

                        return accProxy;
                    }, acc);
            } catch (err) {
                return acc;
            }
        },
        <WorkspaceEntry[]>[]
    )).sort((a, b) => a.name.localeCompare(b.name));
}
