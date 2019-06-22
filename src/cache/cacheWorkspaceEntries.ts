'use strict';

import { notifier } from '../extension';
import { Logger } from '../logger';
import { getWorkspaceEntries } from '../util/getWorkspaceEntries';

export class CacheWorkspaceEntries {
    static caching: boolean = false;

    static async execute(): Promise<void> {
        try {
            const workspaceEntries = await getWorkspaceEntries(false);

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
