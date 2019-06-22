import * as vscode from 'vscode';
import Common from '../common';
import { Environment } from '../environment';

export interface IExtensionState {
    context?: vscode.ExtensionContext;
    environment?: Environment;
    commons?: Common;
    instanceID: string;
}
