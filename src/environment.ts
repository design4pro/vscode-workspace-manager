import * as path from 'path';
import * as vscode from 'vscode';
import { state } from './state';

export enum OsType {
    Windows = 'win32',
    Linux = 'linux',
    Mac = 'darwin'
}

export const SUPPORTED_OS: string[] = Object.keys(OsType)
    .filter(k => !/\d/.test(k))
    .map(k => k.toLowerCase()); // . ["windows", "linux", "mac"];

export class Environment {
    public isPortable: boolean = false;

    public USER_FOLDER?: string;

    public EXTENSION_FOLDER?: string;
    public PATH?: string;

    public OsType: OsType;

    constructor() {
        this.isPortable = !!process.env.VSCODE_PORTABLE;

        this.OsType = process.platform as OsType;

        if (!this.isPortable) {
            if (state.context) {
                this.PATH = path
                    .resolve(state.context.globalStoragePath, '../../..')
                    .concat(path.normalize('/'));
            }

            if (this.PATH) {
                this.USER_FOLDER = path
                    .resolve(this.PATH, 'User')
                    .concat(path.normalize('/'));
            }

            this.EXTENSION_FOLDER = path
                .resolve(
                    vscode.extensions.all.filter(
                        extension => !extension.packageJSON.isBuiltin
                    )[0].extensionPath,
                    '..'
                )
                .concat(path.normalize('/')); // Gets first non-builtin extension's path
        } else {
            this.PATH = process.env.VSCODE_PORTABLE;

            if (this.PATH) {
                this.USER_FOLDER = path
                    .resolve(this.PATH, 'user-data/User')
                    .concat(path.normalize('/'));

                this.EXTENSION_FOLDER = path
                    .resolve(this.PATH, 'extensions')
                    .concat(path.normalize('/'));
            }
        }
    }
}
