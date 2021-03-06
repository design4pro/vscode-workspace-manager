import * as fs from 'fs';
import * as mkdirp from 'mkdirp';
import * as path from 'path';
import * as VError from 'verror';
import * as vscode from 'vscode';
import { IWorkspace } from '../../model/workspace';
import { getFirstWorkspaceFolderName } from '../../util/getFirstWorkspaceFolderName';
import { getWorkspacesDirectories } from '../../util/getWorkspacesDirectories';
import { AbstractCommand } from '../abstractCommand';
import { Command, Commands } from '../common';

@Command()
export class SaveWorkspaceCommand extends AbstractCommand {
    constructor() {
        super(Commands.SaveWorkspace);
    }

    async execute() {
        const workspacesDirectories = getWorkspacesDirectories();

        if (!workspacesDirectories || !workspacesDirectories.length) {
            vscode.window.showInformationMessage(
                'No workspace directories have been configured'
            );

            return;
        }

        const directoryItems = workspacesDirectories.map(
            directory =>
                <vscode.QuickPickItem>{
                    label: path.basename(directory),
                    description: path.dirname(directory)
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
                            workspaceFileName = (
                                workspaceFileName || ''
                            ).trim();

                            if (workspaceFileName === '') {
                                return;
                            }

                            workspaceFileName = workspaceFileName
                                .replace(/\\+/g, '/')
                                .replace(/\/\/+/g, '/')
                                .replace(/^\//, '');

                            workspaceFileName = path.join(
                                ...workspaceFileName.split(/\//)
                            );

                            const workspaceDirectoryPath = path.join(
                                <string>directoryItem.description,
                                directoryItem.label,
                                path.dirname(workspaceFileName)
                            );

                            workspaceFileName = path.basename(
                                workspaceFileName
                            );

                            try {
                                mkdirp.sync(workspaceDirectoryPath);
                            } catch (err) {
                                return;
                            }

                            const workspaceFilePath =
                                path.join(
                                    workspaceDirectoryPath,
                                    workspaceFileName
                                ) + '.code-workspace';

                            const workspaceFolderPaths = (
                                vscode.workspace.workspaceFolders || []
                            ).map(
                                (workspaceFolder: vscode.WorkspaceFolder) => ({
                                    path: workspaceFolder.uri.fsPath
                                })
                            );

                            const workspaceFileContent = JSON.stringify(
                                {
                                    folders: workspaceFolderPaths,
                                    settings: {}
                                },
                                null,
                                4
                            );

                            const workspaceFilePathSaveFunc = () => {
                                try {
                                    fs.writeFileSync(
                                        workspaceFilePath,
                                        workspaceFileContent,
                                        { encoding: 'utf8' }
                                    );

                                    vscode.commands.executeCommand(
                                        Commands.CacheWorkspace
                                    );

                                    vscode.commands.executeCommand(
                                        Commands.SwitchToWorkspace,
                                        <IWorkspace>{
                                            path: workspaceFilePath
                                        }
                                    );
                                } catch (error) {
                                    error = new VError(
                                        error,
                                        `Error while trying to save workspace settings to ${workspaceFilePath}`
                                    );
                                    vscode.window.showErrorMessage(error);
                                }
                            };

                            if (fs.existsSync(workspaceFilePath)) {
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
}
