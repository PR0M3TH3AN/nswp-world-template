/** Do one thing to the kept files. Returns undefined where this browser keeps nothing. */
export declare function fileStore<T>(mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest<T>): Promise<T | undefined>;
