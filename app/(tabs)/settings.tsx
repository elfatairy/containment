import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { Readings } from '@/types';
import { useEffect, useState } from 'react';
import { get, query, ref, set } from 'firebase/database';
import { db } from '@/firebaseConfig';
import { router } from 'expo-router';
import Toast from "react-native-toast-message";
import Loading from '@/components/Loading';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import LanguageToggle from '@/components/LanguageToggle';
import { useTranslation } from 'react-i18next';

type Thresholds = {
  [key in keyof Readings]?: {
    title: string,
    goe: string | number,
    loe: string | number
  };
};

export default function SettingsScreen() {
  const [thresholds, setThresholds] = useState<Thresholds | null>()
  const [loading, setLoading] = useState(true)
  const [savingLoading, setSavingLoading] = useState(false)
  const { t, i18n: { language } } = useTranslation();

  const saveSettings = async () => {
    setSavingLoading(true);
    await set(ref(db, 'settings/thresholds'), thresholds);
    Toast.show({
      type: 'success',
      position: 'bottom',
      text1: t("toasts.settings_saved")
    })
    setSavingLoading(false);
  }

  const getSettings = async () => {
    const snapshot = await get(query(ref(db, 'settings/thresholds')));
    const thresholds = snapshot.val();
    setThresholds(thresholds);
    setLoading(false);
  }

  const changeInput = async (sensor: keyof Readings, op: 'loe' | 'goe', value: string) => {
    setThresholds(prev => {
      const newThresholds: Thresholds = { ...prev };
      const targetedThreshold = newThresholds[sensor];
      if (!prev || !newThresholds || !targetedThreshold)
        return null;

      targetedThreshold[op] = value;

      return newThresholds;
    });
  }

  useEffect(() => {
    getSettings();
  }, [])

  const LessThanIcons = () => language == 'ar-EG' ?
    <MaterialCommunityIcons name="greater-than-or-equal" size={24} color="black" /> :
    <MaterialCommunityIcons name="less-than-or-equal" size={24} color="black" />;

  if (loading || !thresholds) {
    return <Loading />
  }

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
          <Text style={styles.title}>{t("settings.title")}</Text>
        </View>
        <View style={styles.content}>
          <View style={styles.block}>
            <Text style={styles.blockTitle}>{t("settings.app")}</Text>
            <View style={styles.thresholdContainer}>
              <View style={styles.languageContainer}>
                <Text style={styles.label}>{t("settings.language")}</Text>
                <LanguageToggle />
              </View>
            </View>
          </View>
          <View style={styles.block}>
            <Text style={styles.blockTitle}>{t("settings.thresholds")}</Text>
            <View style={styles.thresholdContainer}>
              {
                Object.entries(thresholds).map(([sensor, threshold], index) => <View key={sensor} style={[styles.threshold, (index != Object.entries(thresholds)?.length - 1 ? styles.showSeperator : {})]}>
                  <TextInput style={styles.input} value={threshold.goe.toString()} onChange={(e) => changeInput(sensor as keyof Thresholds, 'goe', e.nativeEvent.text)} />
                  <LessThanIcons />
                  <Text style={styles.sensor}>{t(`sensors.${sensor}`)}</Text>
                  <LessThanIcons />
                  <TextInput style={styles.input} value={threshold.loe.toString()} onChange={(e) => changeInput(sensor as keyof Thresholds, 'loe', e.nativeEvent.text)} />
                </View>)
              }
            </View>
          </View>
          <View style={[styles.saveBtnContainer,
          language == 'ar-EG' ? {
            flexDirection: 'row'
          } : {
            flexDirection: 'row-reverse'
          }
          ]}>
            <TouchableOpacity onPress={saveSettings} style={styles.saveBtn}>
              <Text style={styles.saveBtnText}>{t("settings.save")}</Text>
              {savingLoading && <ActivityIndicator color={"#fff"} />}
            </TouchableOpacity>
          </View>
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
    gap: 30
  },
  block: {
    gap: 12
  },
  blockTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  thresholdContainer: {
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 5,
    backgroundColor: "#0001",
    paddingVertical: 10,
    paddingHorizontal: 20,
    gap: 10
  },
  languageContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  label: {
    fontWeight: 500,
    fontSize: 16
  },
  threshold: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 20
  },
  input: {
    textAlign: 'center',
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#eee",
    padding: 10,
    flex: 1,
    fontSize: 16,
    fontWeight: 500,
  },
  sensor: {
    flex: 2,
    textAlign: 'center',
    fontWeight: 500,
    fontSize: 16,
  },
  showSeperator: {
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#bbb"
  },
  saveBtnContainer: {
  },
  saveBtn: {
    backgroundColor: "#27ae60aa",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 5,
    flexDirection: 'row',
    gap: 8
  },
  saveBtnText: {
    color: "#fff",
    fontWeight: 500,
    fontSize: 18
  },
});
