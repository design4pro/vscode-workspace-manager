import { Command, Commands } from '../../common';
import { AbstractFavorites } from './abstractFavorites';

@Command()
export class AddToFavorites extends AbstractFavorites {
    constructor() {
        super(Commands.AddToFavorites);
    }
}
