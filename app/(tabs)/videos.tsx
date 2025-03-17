import { Entypo, Feather, FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useLoading } from '@/contexts/LoadingContext';
import axios from 'axios';
import Toast, { SuccessToast } from 'react-native-toast-message';
import { useEffect, useState } from 'react';
import Loading from '@/components/Loading';

const SERVER_URL = process.env.EXPO_PUBLIC_SERVER_URL;

export default function VideosLibraryScreen() {
  const [listWidth, setListWidth] = useState(0);
  const [videos, setVideos] = useState<{ name: string; url: string }[]>([]);
  const { t, i18n: { language } } = useTranslation();
  const { setIsLoading } = useLoading();

  function navigateBack() {
    console.log("clicking");
    router.push('/(tabs)')
  }

  async function pickAndUploadVideo() {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['videos'],
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled) {
      const videoUri = result.assets[0].uri;

      const formData = new FormData();
      formData.append("video", {
        uri: videoUri,
        name: `video_${Date.now()}.mp4`,
        type: "video/mp4",
      } as any);

      setIsLoading(true);

      try {
        await axios.post(`${SERVER_URL}/api/upload`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        Toast.show({
          type: 'success',
          position: 'bottom',
          text1: t("toasts.success"),
          text2: t("toasts.video_upload_success")
        })
        await fetchVideos();
      } catch (error) {
        console.error("Upload Error:", error);
        Toast.show({
          type: 'error',
          position: 'bottom',
          text1: t("toasts.failed"),
          text2: t("toasts.video_upload_failed")
        })
      } finally {
        setIsLoading(false);
      }
    }
  }

  async function openVideo(videoName: string) {
    router.push(`/video?name=${videoName}`);
  }

  async function fetchVideos() {
    try {
      console.log("Fetching videos")
      const response = await axios.get(`${SERVER_URL}/api/videos`);
      console.log(response.data ?? response)
      setVideos(response.data);
    } catch (error) {
      console.error("Fetch Error:", error);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  if (!videos)
    return <Loading />

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#ecf9fd', '#f0e8f9']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          flex: 1
        }}
      >
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={navigateBack} style={styles.backBtn}>
            {language == 'ar-EG' ? <MaterialIcons name="arrow-forward-ios" size={24} color="black" /> : <MaterialIcons name="arrow-back-ios" size={24} color="black" />}
          </TouchableOpacity>
          <Text style={styles.title}>{t("library.title")}</Text>
          <TouchableOpacity onPress={pickAndUploadVideo} style={styles.uploadBtn}>
            <Feather name="upload" size={26} color="#0077b6" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <ScrollView contentContainerStyle={styles.videos} onLayout={(e) => setListWidth(e.nativeEvent.layout.width)} >
            {
              videos.map(video => <View style={styles.video} key={video.name}>
                <TouchableOpacity activeOpacity={0.7} onPress={() => openVideo(video.name)}>
                  <Image
                    source={{ uri: `${SERVER_URL}/api/thumbnail/${video.name}` }}
                    style={[styles.thumbnail, {
                      width: listWidth - 20,
                      height: 240 / 320 * (listWidth - 20)
                    }]}
                  />
                </TouchableOpacity>
              </View>)
            }
          </ScrollView>
        </View>
      </LinearGradient>
    </View >
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '',
  },
  headerContainer: {
    flexDirection: 'row',
    paddingVertical: 25,
    paddingHorizontal: 24,
    gap: 20,
    alignItems: 'center',
  },
  backBtn: {
    position: 'absolute',
    zIndex: 20,
    justifyContent: 'center',
    padding: 5,
    flexDirection: 'row',
    left: 24
  },
  uploadBtn: {
    position: 'absolute',
    zIndex: 20,
    justifyContent: 'center',
    padding: 5,
    flexDirection: 'row',
    right: 24,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: 'bold'
  },
  content: {
    paddingHorizontal: 12,
    marginBottom: 90,
    gap: 30,
  },
  videos: {
    alignItems: 'center',
    flexDirection: 'column',
    paddingBottom: 80,
    gap: 10
  },
  video: {
  },
  thumbnail: {
    borderRadius: 5
  }
});
