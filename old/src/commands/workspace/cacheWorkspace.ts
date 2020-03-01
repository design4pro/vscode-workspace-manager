import { cacheWorkspace } from '../../cache/cacheWorkspace';
import { AbstractCommand } from '../abstractCommand';
import { Command, Commands } from '../common';

@Command()
export class CacheWorkspace extends AbstractCommand {
    protected trackSuccess = true;

    constructor() {
        super(Commands.CacheWorkspace);
    }

    async execute() {
        await cacheWorkspace();
    }
}
