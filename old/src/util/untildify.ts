import * as os from 'os';

export const homeDirectory = os.homedir();

export function untildify(path?: string) {
    if (typeof path !== 'string') {
        throw new TypeError(`Expected a string, got ${typeof path}`);
    }

    return homeDirectory ? path.replace(/^~(?=$|\/|\\)/, homeDirectory) : path;
}
