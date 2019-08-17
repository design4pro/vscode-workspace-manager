import * as vscode from 'vscode';

export function getFirstWorkspaceFolderName(): string | undefined {
    return (vscode.workspace.workspaceFolders || [{ name: undefined }])[0].name;
}
