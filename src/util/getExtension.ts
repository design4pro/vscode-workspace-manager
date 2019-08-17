import * as vscode from 'vscode';
import * as VError from 'verror';
import { extensionQualifiedId } from '../constants';
import { Logger } from '../logger';

export function getExtension() {
    let extension: vscode.Extension<any> | undefined;

    try {
        const ext = vscode.extensions.getExtension(extensionQualifiedId);
        extension = ext;
    } catch (err) {
        err = new VError(err, 'Extension was not found.');
        Logger.error(err);
    }

    return extension;
}
