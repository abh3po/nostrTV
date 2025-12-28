import React, { useRef, useState } from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import Video, { VideoRef } from 'react-native-video';

type Props = {
  content: string;
};

const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
const videoExtensions = ['.mp4', '.mov', '.m4v', '.webm'];

function isImage(url: string) {
  return imageExtensions.some(ext => url.toLowerCase().includes(ext));
}

function isVideo(url: string) {
  return videoExtensions.some(ext => url.toLowerCase().includes(ext));
}

export default function NoteRenderer({ content }: Props) {
  const urls = content.match(/https?:\/\/\S+/g) || [];
  const videoRef = useRef<VideoRef | null>(null);
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View>
      <Text style={styles.text}>
        {content.replace(/https?:\/\/\S+/g, '').trim()}
      </Text>

      {urls.map(url => {
        if (isImage(url)) {
          return (
            <Image
              key={url}
              source={{ uri: url }}
              style={styles.image}
              resizeMode="cover"
            />
          );
        }

        if (isVideo(url)) {
          return (
            <Pressable
              key={url}
              focusable
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              style={[styles.videoWrapper, isFocused && styles.focused]}
              onPress={() => videoRef.current?.presentFullscreenPlayer()}
            >
              <Video
                ref={videoRef}
                source={{ uri: url }}
                style={styles.video}
                controls
                resizeMode="contain"
              />
            </Pressable>
          );
        }

        return (
          <Text key={url} style={styles.link}>
            {url}
          </Text>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  text: {
    color: 'white',
    marginBottom: 10,
    fontSize: 20,
  },
  image: {
    width: '100%',
    height: 380,
    borderRadius: 12,
    marginTop: 12,
  },
  videoWrapper: {
    marginTop: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  focused: {
    borderWidth: 3,
    borderColor: '#6BA9FF',
  },
  video: {
    width: '100%',
    height: 400,
    backgroundColor: 'black',
  },
  link: {
    color: '#6BA9FF',
    marginTop: 10,
    fontSize: 18,
  },
});
