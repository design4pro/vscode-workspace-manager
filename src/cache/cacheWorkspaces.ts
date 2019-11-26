import { Container } from '../container';
import { Logger } from '../logger';
import { getWorkspaces } from '../util/getWorkspaces';
import { statusBarCache } from '../util/statusBar/cache';
import { statusBarWorkspace } from '../util/statusBar/workspace';

export class CacheWorkspaces {
    static caching: boolean = false;

    static async execute(): Promise<void> {
        try {
            const workspaces = await getWorkspaces(false);

            if (!workspaces || workspaces.length === 0) {
                Logger.log('No workspaces entries found without cache');
                statusBarCache.statusBarItem.hide();
                return;
            }
        } catch (err) {
            statusBarCache.notify('alert', 'Failed to cache the workspace entries (click for another attempt)');
        } finally {
            statusBarCache.notify('sync', 'Workspace entries cached (click to cache again)');

            statusBarWorkspace.notify();

            void Container.refreshViews();
        }
    }
}
