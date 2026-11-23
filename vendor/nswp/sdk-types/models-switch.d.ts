/** Whether this visitor sees people's own models. On, unless they turned it off here or where they came from: it travels. */
export declare function showsModels(): boolean;
export declare function setShowsModels(on: boolean): void;
export declare function onModelsChange(fn: () => void): () => void;
/** For tests: forget the switch, so it is read afresh. */
export declare function forgetModelsSwitch(): void;
