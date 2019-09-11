import { dirname, join } from 'path';
import { Workspace } from '../model/workspace';
import { getActiveRootPath } from './getPath';
import { getWorkspaces } from './getWorkspaces';

export async function getWorkspaceByRootPath(
    path: string | undefined = getActiveRootPath()
): Promise<Workspace | undefined> {
    const workspaces = await getWorkspaces();

    if (!workspaces || !workspaces.length) {
        return;
    }

    return workspaces.find(entry => {
        let rootPath = entry.workspace.rootPath;

        if (entry.getRootPath().startsWith('.')) {
            rootPath = dirname(entry.workspace.rootPath);

            if (rootPath === path) return true;

            rootPath = join(rootPath, entry.getRootPath());

            if (rootPath.endsWith('/')) {
                rootPath = rootPath.slice(0, -1);
            }
        }

        if (rootPath === path || (path && path.startsWith(rootPath)))
            return true;
    });
}
