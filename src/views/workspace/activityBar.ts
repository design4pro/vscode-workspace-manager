'use strict';

import { WorkspaceExplorerTreeDataProvider } from '../../util/explorer/workspaceExplorerTreeDataProvider';
import { AbstractView } from '../abstractView';
import { View, Views } from '../common';

@View()
export class ActiveBar extends AbstractView {
    constructor() {
        super(Views.ActiveBar);
    }

    execute(): WorkspaceExplorerTreeDataProvider {
        return new WorkspaceExplorerTreeDataProvider();
    }
}
