export namespace Iterables {
    export function* map<T, TMapped>(
        source: Iterable<T> | IterableIterator<T>,
        mapper: (item: T) => TMapped
    ): Iterable<TMapped> {
        for (const item of source) {
            yield mapper(item);
        }
    }
}
