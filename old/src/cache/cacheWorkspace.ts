import * as VError from 'verror';
import * as vscode from 'vscode';
import { Logger } from '../logger';
import { CacheWorkspaces } from './cacheWorkspaces';

export async function cacheWorkspace(): Promise<void> {
    if (CacheWorkspaces.caching) {
        return;
    }

    CacheWorkspaces.caching = true;

    try {
        await CacheWorkspaces.execute();
    } catch (err) {
        err = new VError(err, 'Failed to cache the workspaces');
        Logger.error(err);
        vscode.window.showErrorMessage(err.message);
    } finally {
        CacheWorkspaces.caching = false;
    }
}
