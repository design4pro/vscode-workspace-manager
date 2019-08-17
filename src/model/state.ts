import * as vscode from 'vscode';
import { Environment } from '../environment';

export interface IExtensionState {
    context?: vscode.ExtensionContext;
    environment?: Environment;
    instanceID: string;
}
