import { existsSync, writeFileSync } from 'fs';
import * as mkdirp from 'mkdirp';
import { basename, dirname, join } from 'path';
import * as vscode from 'vscode';
import { WorkspaceEntry } from '../../model/workspaceEntry';
import {
    getFirstWorkspaceFolderName,
    getWorkspaceEntryDirectories,
    refreshTreeDataCommand
} from '../../util';
import { switchToWorkspaceCommand } from './switchToWorkspace';

export function saveWorkspaceCommand() {
    const workspaceEntryDirectories = getWorkspaceEntryDirectories();

    if (!workspaceEntryDirectories.length) {
        vscode.window.showInformationMessage(
            'No workspace directories have been configured'
        );

        return;
    }

    const directoryItems = workspaceEntryDirectories.map(
        directory =>
            <vscode.QuickPickItem>{
                label: basename(directory),
                description: dirname(directory)
            }
    );

    const options = <vscode.QuickPickOptions>{
        matchOnDescription: false,
        matchOnDetail: false,
        placeHolder:
            'Choose a workspace directory to save the new workspace file...'
    };

    vscode.window.showQuickPick(directoryItems, options).then(
        (directoryItem?: vscode.QuickPickItem) => {
            if (!directoryItem) {
                return;
            }

            vscode.window
                .showInputBox(<vscode.InputBoxOptions>{
                    value: getFirstWorkspaceFolderName(),
                    prompt: 'Enter a path for the workspace file...'
                })
                .then(
                    (workspaceFileName?: string) => {
                        workspaceFileName = (workspaceFileName || '').trim();

                        if (workspaceFileName === '') {
                            return;
                        }

                        workspaceFileName = workspaceFileName
                            .replace(/\\+/g, '/')
                            .replace(/\/\/+/g, '/')
                            .replace(/^\//, '');

                        workspaceFileName = join(
                            ...workspaceFileName.split(/\//)
                        );

                        const workspaceDirectoryPath = join(
                            <string>directoryItem.description,
                            directoryItem.label,
                            dirname(workspaceFileName)
                        );

                        workspaceFileName = basename(workspaceFileName);

                        try {
                            mkdirp.sync(workspaceDirectoryPath);
                        } catch (err) {
                            return;
                        }

                        const workspaceFilePath =
                            join(workspaceDirectoryPath, workspaceFileName) +
                            '.code-workspace';

                        const workspaceFolderPaths = (
                            vscode.workspace.workspaceFolders || []
                        ).map((workspaceFolder: vscode.WorkspaceFolder) => ({
                            path: workspaceFolder.uri.fsPath
                        }));

                        const workspaceFileContent = JSON.stringify({
                            folders: workspaceFolderPaths,
                            settings: {}
                        });

                        const workspaceFilePathSaveFunc = () => {
                            try {
                                writeFileSync(
                                    workspaceFilePath,
                                    workspaceFileContent,
                                    { encoding: 'utf8' }
                                );

                                refreshTreeDataCommand();

                                switchToWorkspaceCommand(<WorkspaceEntry>{
                                    path: workspaceFilePath
                                });
                            } catch (error) {
                                vscode.window.showErrorMessage(
                                    'Error while trying to save workspace ' +
                                        `${workspaceFileName} to ${workspaceFilePath}: ${error.message}`
                                );
                            }
                        };

                        if (existsSync(workspaceFilePath)) {
                            vscode.window
                                .showInformationMessage(
                                    `File ${workspaceFilePath} already exists. Do you want to override it?`,
                                    'Yes',
                                    'No'
                                )
                                .then(
                                    (answer?: string) => {
                                        if (
                                            (answer || '')
                                                .trim()
                                                .toLowerCase() !== 'yes'
                                        ) {
                                            return;
                                        }

                                        workspaceFilePathSaveFunc();
                                    },
                                    (reason: any) => {}
                                );
                        } else {
                            workspaceFilePathSaveFunc();
                        }
                    },
                    (reason: any) => {}
                );
        },
        (reason: any) => {}
    );
}
