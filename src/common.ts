'use strict';

import * as nls from 'vscode-nls';
import { InputBoxOptions, window } from 'vscode';
import { IConfig } from './model/config';

const localize = nls.loadMessageBundle();

export default class Common {
    public static getInputBox(token: boolean) {
        const options: InputBoxOptions = {
            placeHolder: localize(
                'common.placeholder.enterWorkspacesSearchPaths',
                'Enter Workspaces search paths'
            ),
            password: false,
            prompt: localize(
                'common.prompt.enterWorkspacesSearchPaths',
                'Enter Workspaces search path (comma separated). Array of directory globs, representing the directories where your .code-workspace files are stored. Press [Enter] or [Esc] to cancel.'
            ),
            ignoreFocusOut: true
        };
        return options;
    }

    public async getPathsAndSave(sett: IConfig): Promise<string> {
        const opt = Common.getInputBox(false);

        const includeGlobPattern = (
            (await window.showInputBox(opt)) || ''
        ).trim();

        if (includeGlobPattern && includeGlobPattern !== 'esc') {
            sett.includeGlobPattern = [includeGlobPattern];
            // const saved = await this.saveSettings(sett);

            // if (saved) {
            //     vscode.window.setStatusBarMessage(
            //         localize('common.info.pathSaved'),
            //         1000
            //     );
            // }
            return includeGlobPattern;
        }
    }
}
