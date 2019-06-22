import { gatherWorkspaceEntries } from './getWorkspaceEntries';
import { Logger } from '../logger';
import { notifier } from '../extension';

export class CacheWorkspaceEntries {
    static caching: boolean = false;

    static async execute(): Promise<void> {
        try {
            notifier.notify('eye', 'Looking for workspace entries...', false);

            const workspaceEntries = await gatherWorkspaceEntries();

            if (!workspaceEntries || workspaceEntries.length === 0) {
                Logger.log('No workspaces found');
                notifier.statusBarItem.hide();
                return;
            }
        } catch (err) {
            notifier.notify(
                'alert',
                'Failed to cache the workspace entries (click for another attempt)'
            );
        } finally {
            notifier.notify(
                'file-submodule',
                'Workspace entries cached (click to cache again)'
            );
        }
    }
}
