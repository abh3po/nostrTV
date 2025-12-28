import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Button,
  StyleSheet,
  Dimensions,
} from 'react-native';
import useRelays from './hooks/useRelays';
import { pool } from './singletons';
import { useNavigation } from '@react-navigation/native';

const TopicsFeed = () => {
  const [activeTab, setActiveTab] = useState<'discover'>('discover');
  const [tagsMap, setTagsMap] = useState(new Map());
  const [loading, setLoading] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [metadataMap, setMetadataMap] = useState(new Map());
  const navigation = useNavigation();

  const { relays } = useRelays();
  const subRef = useRef(null);
  const isMounted = useRef(true);
  const screenWidth = Dimensions.get('window').width;

  // Parse d-tag for hashtags
  function parseRatingDTag(dTagValue: string): { type: string; id: string } {
    const parts = dTagValue.split(':');
    const cleanTag =
      parts.length === 2
        ? parts[1].startsWith('#')
          ? parts[1].slice(1)
          : parts[1]
        : parts[0];

    return {
      type: parts.length === 2 ? parts[0] : 'event',
      id: cleanTag,
    };
  }

  // Handle search submission
  const handleSearchSubmit = () => {
    if (searchTerm.trim()) {
      setSearchOpen(false);
      // Navigate to search results screen
    }
  };

  // Setup Nostr subscription
  useEffect(() => {
    if (!relays.length) return;

    const sub = pool.subscribeMany(
      relays,

      {
        kinds: [34259],
        '#m': ['hashtag'],
        limit: 100,
      },
      {
        onevent: event => {
          console.log('Got event', event);
          const dTag = event.tags.find(t => t[0] === 'd');
          if (!dTag || !dTag[1].startsWith('hashtag:')) return;

          const parsedDTag = parseRatingDTag(dTag[1]);
          console.log('Parsed d tag is', dTag);
          if (parsedDTag.type === 'hashtag') {
            setTagsMap(prev => {
              if (
                event.created_at > prev.get(parsedDTag.id) ||
                !prev.has(parsedDTag.id)
              ) {
                return new Map(prev).set(parsedDTag.id, event.created_at);
              }
              return prev;
            });
          }
        },
        oneose: () => {
          setLoading(false);
        },
      },
    );

    return () => sub.close();
  }, [relays]);

  // Sort tags by recency
  const tags: string[] = Array.from(tagsMap.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([tag]) => tag);

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'discover' && styles.activeTab]}
          onPress={() => setActiveTab('discover')}
        >
          <Text style={styles.tabText}>Recently Rated</Text>
        </TouchableOpacity>
      </View>

      {/* Search Button */}
      <TouchableOpacity
        style={styles.searchButton}
        onPress={() => setSearchOpen(true)}
      >
        <Text style={styles.searchButtonText}>Search</Text>
      </TouchableOpacity>

      {/* Feed */}
      <FlatList
        data={tags}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => navigation.navigate('TopicNotes', { tag: item })}
          >
            <View style={styles.topicCard}>
              <Text style={styles.topicText}>#{item}</Text>
            </View>
          </TouchableOpacity>
        )}
      />

      {/* Search Modal */}
      <Modal visible={searchOpen} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <TextInput
            style={styles.searchInput}
            value={searchTerm}
            onChangeText={setSearchTerm}
            placeholder="Enter topic name"
            autoFocus
            onSubmitEditing={handleSearchSubmit}
          />
          <View style={styles.modalButtons}>
            <Button title="Cancel" onPress={() => setSearchOpen(false)} />
            <Button title="Search" onPress={handleSearchSubmit} />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    padding: 16,
  },
  tabs: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  tab: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#333',
  },
  activeTab: {
    backgroundColor: '#555',
  },
  tabText: {
    color: 'white',
    fontSize: 14,
  },
  searchButton: {
    backgroundColor: '#444',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  searchButtonText: {
    color: 'white',
    fontSize: 16,
  },
  topicCard: {
    backgroundColor: '#222',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  topicText: {
    color: 'white',
    fontSize: 18,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  searchInput: {
    width: '80%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  emptyText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 32,
  },
});

export default TopicsFeed;
