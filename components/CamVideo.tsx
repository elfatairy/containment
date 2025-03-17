import React, { useEffect, useState } from 'react'
import { Image, StyleSheet, Text, View } from 'react-native'

const SERVER_URL = process.env.EXPO_PUBLIC_SERVER_URL;

function CamVideo() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [width, setWidth] = useState(0);

  const fetchImage = async () => {
    try {
      const url = `${SERVER_URL}/api/image?t=${new Date().getTime()}`;
      setImageUrl(url);
      setError(null);
    } catch (e) {
      setError('Failed to load image');
      console.error(e);
    }
  };

  useEffect(() => {
    fetchImage();
    const interval = setInterval(fetchImage, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container} onLayout={e => setWidth(e.nativeEvent.layout.width - 48)}>
      {
        imageUrl && 
        <Image width={width} height={width * 9 / 16} source={{uri: imageUrl}} style={styles.image} />
      }
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingTop: 50,
    flex: 1
  },
  image: {
    borderRadius: 10,
    resizeMode: 'cover',
    backgroundColor: "#0001"
  }
});

export default CamVideo