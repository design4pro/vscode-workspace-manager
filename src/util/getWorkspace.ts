import { dirname, join } from 'path';
import { WorkspaceEntry } from '../model/workspace';
import { getWorkspaceEntries } from './getWorkspaceEntries';

export async function getWorkspaceByRootPath(
    path: string
): Promise<WorkspaceEntry | undefined> {
    const workspaceEntries = await getWorkspaceEntries();

    if (!workspaceEntries || !workspaceEntries.length) {
        return;
    }

    return workspaceEntries.find(workspace => {
        let rootPath = workspace.rootPath;

        if (workspace.rootPath.startsWith('.')) {
            rootPath = dirname(workspace.path);

            if (rootPath === path) return true;

            rootPath = join(rootPath, workspace.rootPath);

            if (rootPath.endsWith('/')) {
                rootPath = rootPath.slice(0, -1);
            }
        }

        return rootPath === path;
    });
}
