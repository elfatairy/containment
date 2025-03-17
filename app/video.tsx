import { useLocalSearchParams } from 'expo-router';
import { VideoView, useVideoPlayer } from 'expo-video';
import React, { useState } from 'react'
import { StyleSheet, View } from 'react-native'

const SERVER_URL = process.env.EXPO_PUBLIC_SERVER_URL;

function Video() {
    const { name } = useLocalSearchParams();
    const [containerWidth, setContainerWidth] = useState(0);
    const videoSource = `${SERVER_URL}/api/uploads/videos/${name}`;

    const player = useVideoPlayer(videoSource, player => {
        player.loop = true;
        player.play();
    });

    return (
        <View style={styles.container} onLayout={e => setContainerWidth(e.nativeEvent.layout.width)}>
            <VideoView style={[styles.video, {
                width: containerWidth,
                height: 275 / 350 * containerWidth
            }]} player={player} allowsFullscreen allowsPictureInPicture />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        inset: 0,
        backgroundColor: "#000",
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 5000,
        elevation: 2
    },
    video: {
    }
})

export default Video