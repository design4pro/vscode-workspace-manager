import * as VError from 'verror';
import * as vscode from 'vscode';
import { Logger } from '../logger';
import { CacheWorkspaceEntries } from './cacheWorkspaceEntries';

export async function cacheWorkspace(): Promise<void> {
    if (CacheWorkspaceEntries.caching) {
        return;
    }

    CacheWorkspaceEntries.caching = true;

    try {
        await CacheWorkspaceEntries.execute();
    } catch (err) {
        err = new VError(err, 'Failed to cache the workspace entries');
        Logger.error(err);
        vscode.window.showErrorMessage(err.message);
    } finally {
        CacheWorkspaceEntries.caching = false;
    }
}
