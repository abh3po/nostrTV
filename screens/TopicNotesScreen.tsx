import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Event, SimplePool } from 'nostr-tools';
import useRelays from '../hooks/useRelays';
import { pool } from '../singletons';
import NoteRenderer from './NoteRendererScreen';

import { RootStackParamList } from '../App'; // adjust path if needed
import { NativeStackScreenProps } from '@react-navigation/native-stack';

type Props = NativeStackScreenProps<RootStackParamList, 'TopicNotes'>;

const TopicNotesScreen = ({ route, navigation }: Props) => {
  const { tag } = route.params;
  const { relays } = useRelays();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  const subRef = useRef<ReturnType<SimplePool['subscribeMany']> | null>(null);
  const seenIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!tag || !relays.length) return;

    subRef.current?.close();

    const sub = pool.subscribeMany(
      relays,
      {
        kinds: [1],
        '#t': [tag],
        limit: 20,
      },
      {
        onevent: event => {
          if (event.kind !== 1) return;
          if (seenIds.current.has(event.id)) return;

          seenIds.current.add(event.id);
          setEvents(prev =>
            [...prev, event].sort((a, b) => b.created_at - a.created_at),
          );
        },
        oneose: () => {
          setLoading(false);
        },
      },
    );

    subRef.current = sub;

    return () => sub.close();
  }, [tag, relays]);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>#{tag}</Text>

      {loading && <ActivityIndicator size="large" color="white" />}

      {!loading && events.length === 0 && (
        <Text style={styles.empty}>No notes found</Text>
      )}

      <FlatList
        data={events}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.noteCard}>
            <Text style={styles.pubkey}>{item.pubkey.slice(0, 12)}...</Text>
            <NoteRenderer content={item.content} />
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    padding: 16,
  },
  header: {
    color: 'white',
    fontSize: 22,
    marginBottom: 12,
  },
  noteCard: {
    backgroundColor: '#222',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  pubkey: {
    color: '#999',
    fontSize: 12,
    marginBottom: 6,
  },
  content: {
    color: 'white',
    fontSize: 16,
  },
  empty: {
    color: 'gray',
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
  },
});

export default TopicNotesScreen;
