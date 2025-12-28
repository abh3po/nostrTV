// types.d.ts

declare const global: any;
declare module '../../../hooks/useRelays' {
  const useRelays: () => { relays: string[] };
  export default useRelays;
}

declare module '../../../singletons' {
  const pool: {
    subscribeMany: (
      relays: string[],
      filters: Filter[],
      options: {
        onevent: (event: Event) => void;
        oneose: () => void;
      },
    ) => {
      close: () => void;
    };
  };
  export default pool;
}
