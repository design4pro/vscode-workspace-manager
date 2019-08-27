import { sortBy } from 'lodash';
import * as path from 'path';
import * as vscode from 'vscode';

function absolute(s: string) {
    return path.isAbsolute
        ? path.isAbsolute.bind(path)(s)
        : path.resolve(s) === s;
}

export function getRootPath(basePath?: string) {
    const { workspaceFolders } = vscode.workspace;

    if (!workspaceFolders) return;

    const firstRootPath = workspaceFolders[0].uri.fsPath;

    if (!basePath || !absolute(basePath)) return firstRootPath;

    const rootPaths = workspaceFolders.map(folder => folder.uri.fsPath),
        sortedRootPaths = sortBy(rootPaths, [path => path.length]).reverse(); // In order to get the closest root

    return sortedRootPaths.find(rootPath => basePath.startsWith(rootPath));
}

export function getActiveRootPath() {
    const { activeTextEditor } = vscode.window,
        editorPath = activeTextEditor && activeTextEditor.document.uri.fsPath;

    return getRootPath(editorPath);
}
