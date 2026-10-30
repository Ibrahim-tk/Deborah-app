type Api = (() => void) & { setProgress: (p: number) => void; wind: () => void };
export function mountGenesisTree(els: Record<string, HTMLElement>, opts?: { onReady?: () => void }): Promise<Api>;
