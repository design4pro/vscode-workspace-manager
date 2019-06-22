'use strict';

import { workspace } from 'vscode';

export function getFirstWorkspaceFolderName(): string | undefined {
    return (workspace.workspaceFolders || [{ name: undefined }])[0].name;
}
