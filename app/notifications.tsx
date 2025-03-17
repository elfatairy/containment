import Loading from '@/components/Loading';
import { db } from '@/firebaseConfig';
import { FontAwesome5, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { onValue, ref } from 'firebase/database';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dimensions, FlatList, LayoutRectangle, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Notification = {
  latestReadings: {
    // spo2: number,
    heartrate: number,
    location: {
      latitude: string,
      longitude: string
    },
    vibration: 'detected' | 'undetected'
  },
  averageReadings: {
    // spo2: number,
    heartrate: number
  },
  start: number,
  end?: number,
  readingCount: number
}

const Notification = ({ item, isRunning }: { item: Notification, isRunning: boolean }) => {
  const { t } = useTranslation();
  const [duration, setDuration] = useState('');

  function openMaps() {
    const url = `https://www.google.com/maps/search/?api=1&query=${item.latestReadings.location.latitude},${item.latestReadings.location.longitude}`
    Linking.openURL(url)
  }

  function getDuration() {
    let endTime = item.end;
    let startTime = item.start;

    if (!item.end) {
      setTimeout(getDuration, 60000);
      endTime = new Date().getTime();
    }

    const hours = Math.floor((endTime as number - startTime) / 1000 / 60 / 60);
    const minutes = Math.floor(((endTime as number - startTime) % (1000 * 60 * 60)) / 1000 / 60);

    const hoursText = hours ? `${hours}${t('notifications.hour')} ` : ``;
    // if(duration != `${hoursText}${minutes}m`)
    setDuration(`${hoursText}${minutes}${t('notifications.minute')}`)
  }

  useEffect(() => {
    getDuration();
  }, [])

  return (
    <View style={[styles.notificationItem, isRunning && styles.latestNotification]}>
      <View style={styles.header}>
        <Text style={styles.durationText}>{t("notifications.duration")}: {duration}</Text>
        <TouchableOpacity onPress={openMaps}>
          <Ionicons name="location-outline" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>
      <View style={styles.sensorReadings}>
        <View style={styles.readingsColumn}>
          <Text style={styles.columnTitle}>{t("notifications.latest")}</Text>
          <View style={styles.textContainer}>
            <View>
              <FontAwesome5 name="heartbeat" size={16} color="#c0392b" />
            </View>
            <Text style={styles.text}>
              {Math.floor(item.latestReadings.heartrate * 100) / 100} bpm
            </Text>
          </View>
          {/* <View style={styles.textContainer}>
            <View style={styles.spo2Icon}>
              <FontAwesome5 name="tint" size={16} color="#2980b9" />
            </View>
            <Text style={styles.text}>
              {item.latestReadings.spo2}%
            </Text>
          </View> */}
          <View style={styles.textContainer}>
            <View>
              <MaterialIcons name="vibration" size={16} color="#7c2d45" />
            </View>
            <Text style={styles.text}>
              {t(`notifications.${item.latestReadings.vibration}`)}
            </Text>
          </View>
        </View>
        <View style={styles.readingsColumn}>
          <Text style={styles.columnTitle}>{t("notifications.average")}</Text>
          <View style={styles.textContainer}>
            <View>
              <FontAwesome5 name="heartbeat" size={16} color="#c0392b" />
            </View>
            <Text style={styles.text}>
              {Math.floor(item.averageReadings.heartrate * 100) / 100} bpm
            </Text>
          </View>
          {/* <View style={styles.textContainer}>
            <View style={styles.spo2Icon}>
              <FontAwesome5 name="tint" size={16} color="#2980b9" />
            </View>
            <Text style={styles.text}>
              {item.averageReadings.spo2}%
            </Text>
          </View> */}
        </View>
      </View>
    </View>
  )
}

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<Notification[]>();
  const [latestNotification, setLatestNotification] = useState(0);
  const [fetching, setFetching] = useState(true);
  const { t, i18n: { language } } = useTranslation();

  function fetchNotifications() {
    const unsubscribe = onValue(ref(db, '/notifications'), snapshot => {
      const newNotifications = snapshot.val();

      if (newNotifications)
        setNotifications(newNotifications);

      setFetching(false);
    });

    return unsubscribe;
  }

  function listenToLatestNotification() {
    const unsubscribe = onValue(ref(db, '/latestNotification'), snapshot => {
      setLatestNotification(snapshot.val());
    });

    return unsubscribe;
  }

  useEffect(() => {
    const unsubscribeFetching = fetchNotifications();
    const unsubscribeListeningToLatestNotifications = listenToLatestNotification();

    return () => {
      unsubscribeFetching();
      unsubscribeListeningToLatestNotifications();
    }
  }, []);

  if (fetching)
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
          <TouchableOpacity onPress={() => {
            console.log("clicking");
            router.push('/(tabs)')
          }} style={styles.backBtn}>
            {language == 'ar-EG' ? <MaterialIcons name="arrow-forward-ios" size={24} color="black" /> : <MaterialIcons name="arrow-back-ios" size={24} color="black" />}
          </TouchableOpacity>
          <Text style={styles.title}>{t("notifications.title")}</Text>
        </View>
        <View style={styles.content}>
          {
            notifications?.length ?
              <FlatList
                data={Object.entries(notifications).sort(
                  ([indexA, _], [indexB, __]) => Number(indexB) - Number(indexA)
                )}
                renderItem={({ item: [index, notification] }) => <Notification item={notification} isRunning={latestNotification == Number(index)} />}
                keyExtractor={([index, _]) => index}
                contentContainerStyle={styles.listContainer} />
              :
              <View style={styles.emptyHistoryContainer}>
                <Text style={styles.emptyHistoryText}>The notifications history is empty</Text>
              </View>
          }
        </View>
      </LinearGradient>
    </View>
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
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: 'bold'
  },
  content: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    gap: 30,
    flex: 1
  },
  emptyHistoryContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 120
  },
  emptyHistoryText: {
    fontSize: 22,
    fontWeight: 500
  },
  listContainer: {
    padding: 0,
  },
  notificationItem: {
    backgroundColor: "#ffffffee",
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  latestNotification: {
    backgroundColor: "#fff5f5ee",
    borderColor: "#ff6b6bee",
    borderWidth: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  headerText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  durationText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  sensorReadings: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  readingsColumn: {
    flex: 1,
    gap: 1
  },
  columnTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#666",
    marginBottom: 4
  },
  textContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8
  },
  spo2Icon: {
    width: 17,
    alignItems: 'center'
  },
  text: {
    fontSize: 14,
    marginBottom: 4,
    color: "#555",
  },
});
