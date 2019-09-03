import * as VError from 'verror';
import { window } from 'vscode';
import { configuration } from '../../configuration';
import { AbstractCommand } from '../abstractCommand';
import { Command, Commands } from '../common';

@Command()
export class AddToFavorites extends AbstractCommand {
    protected trackSuccess = true;

    constructor() {
        super(Commands.AddToFavorites);
    }

    async execute() {
        const isFavorite = await configuration.getWorkspace('favorite', false);

        try {
            await configuration.updateWorkspace('favorite', !isFavorite);

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
