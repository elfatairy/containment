import { Dimensions, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';
import { Entypo, FontAwesome, FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { ReactElement, ReactNode, useEffect, useState } from 'react';
import { ref, onValue } from "firebase/database";
import { db } from '@/firebaseConfig';
import Loading from '@/components/Loading';
import { router } from 'expo-router';
import { Readings } from '@/types';
import Toast from 'react-native-toast-message';
import { useTranslation } from 'react-i18next';
import CamVideo from '@/components/CamVideo';

interface SensorBlockProps {
  Icon: React.FC;
  label: string;
  value: string | number;
  color: string;
  suffix: string;
  width: number;
}

const SensorBlock = ({ Icon, label, value, suffix, color, width }: SensorBlockProps) => (
  <View style={[styles.block, { backgroundColor: "#fff" }, { width }]}>
    {/* // <View style={[styles.block, { backgroundColor: 'transparent' }, { width }]}> */}
    <Icon />
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value}{suffix}</Text>
  </View>
);


export default function HomeScreen() {
  const [readings, setReadings] = useState<Readings | null>();
  const [blocksWidth, setBlocksWidth] = useState(0);
  const { t } = useTranslation();

  useEffect(() => {
    const readingsRef = ref(db, 'readings');
    onValue(readingsRef, (snapshost) => {
      const val = snapshost.val();
      setReadings(val);
    })
  }, [])

  const openLocation = async () => {
    if (!readings || !readings?.location) {
      Toast.show({
        type: 'error',
        position: 'bottom',
        text1: t("toasts.location_not_available"),
        text1Style: {
          fontSize: 16
        }
      })
      return;
    }

    const url = `https://www.google.com/maps/search/?api=1&query=${readings?.location.latitude},${readings?.location.longitude}`;
    Linking.openURL(url)
      .then((supported) => {
        if (!supported) {
          console.error("Can't handle url: " + url);
        } else {
          console.log('Opened URL: ' + url);
        }
      })
      .catch((err) => console.error('An error occurred', err));
  }

  if (!readings) {
    return <Loading />
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#ecf9fd', '#f0e8f9']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{flex: 1}}
      >
        <View style={styles.headerContainer}>
          <Text style={styles.title}>{t("greeting")}</Text>
          <View style={styles.icons}>
            <TouchableOpacity onPress={openLocation}>
              <Entypo name="location-pin" size={30} color="#0077b6" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => {
              router.push('/notifications')
            }}>
              <FontAwesome name="bell" size={24} color="#0077b6" />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.content}>
          <View style={styles.blockContainer} onLayout={(event) => {
            const { width } = event.nativeEvent.layout;
            setBlocksWidth(width);
          }}>
            <SensorBlock
              Icon={() => <FontAwesome5 name="heartbeat" size={24} color="#c0392b" />}
              label={t("sensors.heartrate")}
              value={readings.heartrate}
              suffix=' bpm'
              color="#c0392b"
              width={(blocksWidth - 58) / 2}
            />
            {/* <SensorBlock
              Icon={() => <FontAwesome5 name="tint" size={24} color="#2980b9" />}
              label={t("sensors.spo2")}
              value={readings.spo2}
              suffix='%'
              color="#2980b9"
              width={(blocksWidth - 58) / 2}
            /> */}
            <SensorBlock
              Icon={() => <MaterialIcons name="vibration" size={24} color="#7c2d45" />}
              label={t("sensors.vibration")}
              value={t(`sensors.vibration.value.${readings.vibration}`)}
              suffix=''
              color="#7c2d45"
              width={(blocksWidth - 58) / 2}
            />
          </View>
          <CamVideo />
        </View>
      </LinearGradient>
    </View >
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    backgroundColor: '',
    alignItems: 'center',
  },
  headerContainer: {
    flexDirection: 'row',
    paddingVertical: 25,
    paddingHorizontal: 26,
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold'
  },
  icons: {
    flexDirection: 'row',
    gap: 20,
    alignItems: 'center'
  },
  content: {
    justifyContent: 'flex-start',
    flex: 1,
    width: "100%"
  },
  blockContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    width: "100%",
    paddingTop: 30,
    gap: 10
  },
  block: {
    // width: 150,
    height: 150,
    borderRadius: 20,
    padding: 24,
    // margin: 8,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    flex: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  value: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 4,
  },
});
