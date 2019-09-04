import * as VError from 'verror';
import { commands, window } from 'vscode';
import { configuration } from '../../configuration';
import { IWorkspaceCommandArgs } from '../../model/workspace';
import { AbstractCommand, CommandContext } from '../abstractCommand';
import { Command, Commands } from '../common';

@Command()
export class AddToFavorites extends AbstractCommand {
    protected trackSuccess = true;

    constructor() {
        super(Commands.AddToFavorites);
    }

    async execute(context?: CommandContext, args: IWorkspaceCommandArgs = {}) {
        args = { ...args };

        console.log(args);

        let workspaceFilePath;

        if (args.workspaceEntry) {
            workspaceFilePath = args.workspaceEntry.path;
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
                    'Workspace removed from favorite!'
                );
            } else {
                window.showInformationMessage('Workspace added to favorite!');
            }
        } catch (error) {
            error = new VError(
                error,
                'Could not add the workspace to favorite!'
            );
            window.showErrorMessage(error);
            throw error;
        }
    }
}
