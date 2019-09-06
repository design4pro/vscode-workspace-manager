import * as VError from 'verror';
import { commands, window } from 'vscode';
import { configuration } from '../../../configuration';
import { IWorkspaceCommandArgs } from '../../../model/workspace';
import { AbstractCommand, CommandContext } from '../../abstractCommand';
import { Commands } from '../../common';

export abstract class AbstractFavorites extends AbstractCommand {
    protected trackSuccess = true;

    async execute(context?: CommandContext, args: IWorkspaceCommandArgs = {}) {
        args = { ...args };

        let workspaceFilePath;
        let workspaceName;

        if (args.workspaceEntry) {
            workspaceFilePath = args.workspaceEntry.path;
            workspaceName = args.workspaceEntry.name;
        }

        const isFavorite = await configuration.getWorkspace(
            'favorite',
            false,
            workspaceFilePath
        );

        try {
            await configuration.updateWorkspace(
                'favorite',
                !isFavorite,
                workspaceFilePath
            );

            commands.executeCommand(Commands.CacheWorkspace);

            if (isFavorite) {
                window.showInformationMessage(
                    `Workspace '${workspaceName}' removed from favorites!`
                );
            } else {
                window.showInformationMessage(
                    `Workspace '${workspaceName}' added to favorites!`
                );
            }
        } catch (error) {
            error = new VError(
                error,
                'Could not add the workspace to favorites!'
            );
            window.showErrorMessage(error);
            throw error;
        }
    }
}
