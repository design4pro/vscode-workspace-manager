import { Logger } from '../logger';
import { getWorkspaceEntries } from '../util/getWorkspaceEntries';
import { statusBarCache } from '../util/statusBar/cache';
import { statusBarWorkspace } from '../util/statusBar/workspace';

export class CacheWorkspaceEntries {
    static caching: boolean = false;

    static async execute(): Promise<void> {
        try {
            const workspaceEntries = await getWorkspaceEntries(false);

            if (!workspaceEntries || workspaceEntries.length === 0) {
                Logger.log('No workspaces entries found without cache');
                statusBarCache.statusBarItem.hide();
                return;
            }
        } catch (err) {
            statusBarCache.notify(
                'alert',
                'Failed to cache the workspace entries (click for another attempt)'
            );
        } finally {
            statusBarCache.notify(
                'file-submodule',
                'Workspace entries cached (click to cache again)'
            );

            statusBarWorkspace.notify();
        }
    }
}
