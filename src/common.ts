import * as vscode from 'vscode';
import * as nls from 'vscode-nls';
import { ExtensionConfig } from './model/extensionConfig';

const localize = nls.loadMessageBundle();

export default class Common {
    public static getInputBox(token: boolean) {
        const options: vscode.InputBoxOptions = {
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

    public async getPathsAndSave(sett: ExtensionConfig): Promise<string> {
        const opt = Common.getInputBox(false);

        const paths = ((await vscode.window.showInputBox(opt)) || '').trim();

        if (paths && paths !== 'esc') {
            sett.paths = paths;
            // const saved = await this.saveSettings(sett);

            // if (saved) {
            //     vscode.window.setStatusBarMessage(
            //         localize('common.info.pathSaved'),
            //         1000
            //     );
            // }
            return paths;
        }
    }
}
