'use strict';

import { AbstractCommand } from '../abstractCommand';
import { Command, Commands } from '../common';
import { getWorkspaceEntryDirectories } from '../../util/getWorkspaceEntryDirectories';
import {
    window,
    QuickPickItem,
    QuickPickOptions,
    InputBoxOptions,
    workspace,
    WorkspaceFolder,
    commands
} from 'vscode';
import { basename, dirname, join } from 'path';
import { getFirstWorkspaceFolderName } from '../../util/getFirstWorkspaceFolderName';
import * as mkdirp from 'mkdirp';
import { writeFileSync, existsSync } from 'fs';
import { WorkspaceEntry } from '../../model/workspace';

@Command()
export class SaveWorkspaceCommand extends AbstractCommand {
    constructor() {
        super(Commands.SaveWorkspace);
    }

    async execute() {
        const workspaceEntryDirectories = getWorkspaceEntryDirectories();

        if (!workspaceEntryDirectories.length) {
            window.showInformationMessage(
                'No workspace directories have been configured'
            );

            return;
        }

        const directoryItems = workspaceEntryDirectories.map(
            directory =>
                <QuickPickItem>{
                    label: basename(directory),
                    description: dirname(directory)
                }
        );

        const options = <QuickPickOptions>{
            matchOnDescription: false,
            matchOnDetail: false,
            placeHolder:
                'Choose a workspace directory to save the new workspace file...'
        };

        window.showQuickPick(directoryItems, options).then(
            (directoryItem?: QuickPickItem) => {
                if (!directoryItem) {
                    return;
                }

                window
                    .showInputBox(<InputBoxOptions>{
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
                                join(
                                    workspaceDirectoryPath,
                                    workspaceFileName
                                ) + '.code-workspace';

                            const workspaceFolderPaths = (
                                workspace.workspaceFolders || []
                            ).map((workspaceFolder: WorkspaceFolder) => ({
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

                                    commands.executeCommand(
                                        Commands.RefreshTreeData
                                    );

                                    commands.executeCommand(
                                        Commands.SwitchToWorkspace,
                                        <WorkspaceEntry>{
                                            path: workspaceFilePath
                                        }
                                    );
                                } catch (error) {
                                    window.showErrorMessage(
                                        'Error while trying to save workspace ' +
                                            `${workspaceFileName} to ${workspaceFilePath}: ${error.message}`
                                    );
                                }
                            };

                            if (existsSync(workspaceFilePath)) {
                                window
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
