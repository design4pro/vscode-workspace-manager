import { dirname } from 'path';
import { WorkspaceEntry } from '../model/workspace';
import { getWorkspaceEntries } from './getWorkspaceEntries';

export async function getWorkspaceByRootPath(
    path: string
): Promise<WorkspaceEntry | undefined> {
    const workspaceEntries = await getWorkspaceEntries();

    if (!workspaceEntries || !workspaceEntries.length) {
        return;
    }

    return workspaceEntries.find(
        workspace => dirname(workspace.rootPath) === path
    );
}
