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

        let workspacePath;
        let workspaceName;

        if (args.workspace) {
            workspacePath = args.workspace.getPath;
            workspaceName = args.workspace.name;
        }

        const isFavorite = await configuration.getWorkspace(
            'favorite',
            false,
            workspacePath
        );

        try {
            await configuration.updateWorkspace(
                'favorite',
                !isFavorite,
                workspacePath
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
