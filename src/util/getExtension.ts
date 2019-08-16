import { Extension, extensions } from 'vscode';
import * as VError from 'verror';
import { extensionQualifiedId } from '../constants';
import { Logger } from '../logger';

export function getExtension() {
    let extension: Extension<any> | undefined;

    try {
        const ext = extensions.getExtension(extensionQualifiedId);
        extension = ext;
    } catch (err) {
        err = new VError(err, 'Extension was not found.');
        Logger.error(err);
    }

    return extension;
}
