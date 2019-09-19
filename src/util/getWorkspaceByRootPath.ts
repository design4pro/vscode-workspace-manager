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

    return workspaces.find(workspace => {
        if (!workspace) return false;

        let rootPath = workspace.rootPath;

        if (rootPath.startsWith('.')) {
            rootPath = dirname(workspace.path);

            if (rootPath === path) return true;

            rootPath = join(rootPath, workspace.rootPath);

            if (rootPath.endsWith('/')) {
                rootPath = rootPath.slice(0, -1);
            }
        }

        if (rootPath === path || (path && path.startsWith(rootPath))) {
            return true;
        }
    });
}
