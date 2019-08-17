import * as vscode from 'vscode';
import { state } from '../state';

/**
 * @name now
 * @desc Helpfer function to get the current timestamp
 * @function
 * @private
 * @return {number} Current Unix Timestamp in seconds
 */
const now = (): number => Math.floor(Date.now() / 1000);

export class Cache {
    context: vscode.ExtensionContext;
    namespace: string;
    cache: any;

    constructor(namespace?: string) {
        // ExtensionContext
        this.context = <vscode.ExtensionContext>state.context;

        // Namespace of the context's globalState
        this.namespace = namespace || 'cache';

        // Local cache object
        this.cache = this.context.globalState.get(this.namespace, {});
    }

    /**
     * Store an item in the cache, with optional expiration.
     *
     * @param {string} key - The unique key for the cached item
     * @param {any} value - The value to cache
     * @param {number} [expiration] - Optional expiration time in seconds
     * @returns {Promise} Visual Studio Code Thenable (Promise)
     */
    update<T>(key: string, value: T, expiration: number = 3600): Thenable<any> {
        // Parameter type checking
        if (typeof key !== 'string' || typeof value === 'undefined') {
            return new Promise((resolve, reject) => {
                resolve(false);
            });
        }

        let obj: any = {
            value: value
        };

        // Set expiration
        if (Number.isInteger(expiration)) {
            obj.expiration = now() + expiration;
        }

        // Save to local cache object
        this.cache[key] = obj;

        // Save to extension's globalState
        return this.context.globalState.update(this.namespace, this.cache);
    }

    /**
     * @name Cache#get
     * @desc Get an item from the cache, or the optional default value
     * @function
     * @param {string} key - The unique key for the cached item
     * @param {any} [defaultValue] - The optional default value to return if the cached item does not exist or is expired
     * @returns {any} Returns the cached value or optional defaultValue
     */
    get<T>(key: string, defaultValue: T): T | undefined {
        // If doesn't exist
        if (typeof this.cache[key] === 'undefined') {
            // Return default value
            if (typeof defaultValue !== 'undefined') {
                return defaultValue;
            } else {
                return undefined;
            }
        } else {
            // Is item expired?
            if (this.isExpired(key)) {
                return undefined;
            }
            // Otherwise return the value
            return this.cache[key].value;
        }
    }

    // Alias of get
    fetch<T>(key: string, defaultValue: T): T | undefined {
        return this.get<T>(key, defaultValue);
    }

    // Alias of get
    retrieve<T>(key: string, defaultValue: T) {
        return this.get<T>(key, defaultValue);
    }

    /**
     * @name Cache#has
     * @desc Checks to see if unexpired item exists in the cache
     * @function
     * @param {string} key - The unique key for the cached item
     * @return {boolean}
     */
    has(key: string): boolean {
        if (typeof this.cache[key] === 'undefined') {
            return false;
        } else {
            return this.isExpired(key) ? false : true;
        }
    }

    // Alias of has
    exists(key: any) {
        return this.has(key);
    }

    /**
     * @name Cache#forget
     * @desc Removes an item from the cache
     * @function
     * @param {string} key - The unique key for the cached item
     * @returns {Thenable} Visual Studio Code Thenable (Promise)
     */
    forget(key: string): Thenable<any> {
        // Does item exist?
        if (typeof this.cache[key] === 'undefined') {
            return new Promise(function(resolve, reject) {
                resolve(true);
            });
        }

        // Delete from local object
        delete this.cache[key];

        // Update the extension's globalState
        return this.context.globalState.update(this.namespace, this.cache);
    }

    // Alias of forget
    remove(key: string) {
        return this.forget(key);
    }

    // Alias of forget
    delete(key: string) {
        return this.forget(key);
    }

    /**
     * @name Cache#keys
     * @desc Get an array of all cached item keys
     * @function
     * @return {string[]}
     */
    keys(): string[] {
        return Object.keys(this.cache);
    }

    /**
     * @name Cache#all
     * @desc Returns object of all cached items
     * @function
     * @return {object}
     */
    all(): object {
        let items: any = {};

        for (let key in this.cache) {
            items[key] = this.cache[key].value;
        }

        return items;
    }

    // Alias of all
    getAll() {
        return this.all();
    }

    /**
     * @name Cache#flush
     * @desc Clears all items from the cache
     * @function
     * @returns {Thenable} Visual Studio Code Thenable (Promise)
     */
    flush(): Thenable<void> {
        this.cache = {};

        return this.context.globalState.update(this.namespace, undefined);
    }

    // Alias of flush
    clearAll() {
        return this.flush();
    }

    /**
     * @name Cache#expiration
     * @desc Gets the expiration time for the cached item
     * @function
     * @param {string} key - The unique key for the cached item
     * @return {number} Unix Timestamp in seconds
     */
    getExpiration(key: string): number | undefined {
        if (
            typeof this.cache[key] === 'undefined' ||
            typeof this.cache[key].expiration === 'undefined'
        ) {
            return undefined;
        } else {
            return this.cache[key].expiration;
        }
    }

    /**
     * @name Cache#isExpired
     * @desc Checks to see if cached item is expired
     * @function
     * @param {string} key - Cached item key
     * @return {boolean}
     */
    isExpired(key: string): boolean {
        // If key doesn't exist or it has no expiration
        if (
            typeof this.cache[key] === 'undefined' ||
            typeof this.cache[key].expiration === 'undefined'
        ) {
            return false;
        } else {
            // Is expiration >= right now?
            return now() >= this.cache[key].expiration;
        }
    }
}
