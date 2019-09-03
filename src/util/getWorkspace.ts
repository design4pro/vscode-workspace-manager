import { dirname, join } from 'path';
import { WorkspaceEntry } from '../model/workspace';
import { getActiveRootPath } from './getPath';
import { getWorkspaceEntries } from './getWorkspaceEntries';

export async function getWorkspaceByRootPath(
    path: string | undefined = getActiveRootPath()
): Promise<WorkspaceEntry | undefined> {
    const workspaceEntries = await getWorkspaceEntries();

    if (!workspaceEntries || !workspaceEntries.length) {
        return;
    }

    return workspaceEntries.find(entry => {
        let rootPath = entry.rootPath;

        if (entry.rootPath.startsWith('.')) {
            rootPath = dirname(entry.path);

            if (rootPath === path) return true;

            rootPath = join(rootPath, entry.rootPath);

            if (rootPath.endsWith('/')) {
                rootPath = rootPath.slice(0, -1);
            }
        }

        if (rootPath === path || (path && path.startsWith(rootPath)))
            return true;
    });
}
