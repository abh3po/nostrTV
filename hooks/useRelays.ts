// hooks/useRelays.ts
export default function useRelays() {
  // In a real implementation, this would get relays from context/state
  return {
    relays: [
      'wss://relay.damus.io',
      'wss://relay.primal.net',
      'wss;//relay.nostr.band',
      'wss://nos.lol',
    ],
  };
}
