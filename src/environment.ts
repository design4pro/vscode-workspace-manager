'use strict';

import { normalize, resolve } from 'path';
import { extensions } from 'vscode';
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
                this.PATH = resolve(
                    state.context.globalStoragePath,
                    '../../..'
                ).concat(normalize('/'));
            }

            if (this.PATH) {
                this.USER_FOLDER = resolve(this.PATH, 'User').concat(
                    normalize('/')
                );
            }

            this.EXTENSION_FOLDER = resolve(
                extensions.all.filter(
                    extension => !extension.packageJSON.isBuiltin
                )[0].extensionPath,
                '..'
            ).concat(normalize('/')); // Gets first non-builtin extension's path
        } else {
            this.PATH = process.env.VSCODE_PORTABLE;

            if (this.PATH) {
                this.USER_FOLDER = resolve(this.PATH, 'user-data/User').concat(
                    normalize('/')
                );

                this.EXTENSION_FOLDER = resolve(this.PATH, 'extensions').concat(
                    normalize('/')
                );
            }
        }
    }
}
