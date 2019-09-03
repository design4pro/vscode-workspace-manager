import { configuration } from '../../configuration';
import { AbstractCommand } from '../abstractCommand';
import { Command, Commands } from '../common';
import { ConfigurationTarget, window } from 'vscode';

@Command()
export class AddToFavorites extends AbstractCommand {
    protected trackSuccess = true;

    constructor() {
        super(Commands.AddToFavorites);
    }

    async execute() {
        const isFavorite = configuration.get(
            configuration.name('workspace')('favorite').value,
            null,
            false
        );

        configuration
            .update(
                configuration.name('workspace')('favorite').value,
                !isFavorite,
                ConfigurationTarget.Workspace
            )
            .then(
                value => {
                    if (isFavorite) {
                        window.showInformationMessage(
                            'Workspace removed from favorite!'
                        );
                    } else {
                        window.showInformationMessage(
                            'Workspace added to favorite!'
                        );
                    }
                },
                value =>
                    window.showErrorMessage(
                        'Could not add the workspace to favorite!'
                    )
            );
    }
}
