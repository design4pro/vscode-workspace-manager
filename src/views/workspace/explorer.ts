'use strict';

import { WorkspaceExplorerTreeDataProvider } from '../../util/explorer/workspaceExplorerTreeDataProvider';
import { AbstractView } from '../abstractView';
import { View, Views } from '../common';

@View()
export class Explorer extends AbstractView {
    constructor() {
        super(Views.Explorer);
    }

    execute(): WorkspaceExplorerTreeDataProvider {
        return new WorkspaceExplorerTreeDataProvider();
    }
}
