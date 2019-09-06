import { Command, Commands } from '../../common';
import { AbstractFavorites } from './abstractFavorites';

@Command()
export class RemoveFromFavorites extends AbstractFavorites {
    constructor() {
        super(Commands.RemoveFromFavorites);
    }
}
