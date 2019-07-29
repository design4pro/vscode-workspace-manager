'use strict';

import { ExtensionContext } from 'vscode';
import { Environment } from '../environment';

export interface IExtensionState {
    context?: ExtensionContext;
    environment?: Environment;
    instanceID: string;
}
