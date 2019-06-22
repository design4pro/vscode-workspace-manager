'use strict';

import { ExtensionContext } from 'vscode';
import Common from '../common';
import { Environment } from '../environment';

export interface IExtensionState {
    context?: ExtensionContext;
    environment?: Environment;
    commons?: Common;
    instanceID: string;
}
