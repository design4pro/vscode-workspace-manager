import { readdirSync, statSync } from 'fs';
import { join } from 'path';
import { WorkspaceEntry } from '../model/workspaceEntry';
import { getWorkspaceEntryDirectories } from './getWorkspaceEntryDirectories';

export function gatherWorkspaceEntries(): WorkspaceEntry[] {
    const directoryPaths = getWorkspaceEntryDirectories();
    const uniqueWorkspaceEntries: any = {};

    return (<WorkspaceEntry[]>directoryPaths.reduce(
        (acc: WorkspaceEntry[], dir: string) => {
            return readdirSync(dir)
                .filter(fileName => {
                    try {
                        return (
                            /.code-workspace$/.test(fileName) &&
                            statSync(join(dir, fileName)).isFile()
                        );
                    } catch (err) {
                        return false;
                    }
                })
                .reduce((accProxy: WorkspaceEntry[], fileName: string) => {
                    accProxy.push({
                        name: fileName.replace(/.code-workspace$/, ''),
                        path: join(dir, fileName)
                    });

                    return accProxy;
                }, acc);
        },
        <WorkspaceEntry[]>[]
    ))
        .filter(workspaceEntry => {
            if (uniqueWorkspaceEntries[workspaceEntry.path]) {
                return false;
            }

            uniqueWorkspaceEntries[workspaceEntry.path] = true;

            return true;
        })
        .sort((a, b) => a.name.localeCompare(b.name));
}
