// src/context/NotificationContext.tsx
import React, { createContext, useContext, useState, ReactNode, useRef, useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { Unsubscribe, get, onValue, ref } from 'firebase/database';
import { db } from '@/firebaseConfig';
import { Readings } from '@/types';
import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';

interface NotificationContextType {
}

const NotificationContext = createContext<NotificationContextType | null>(null);

interface NotificationProviderProps {
  children: ReactNode;
}

const BACKGROUND_FETCH_TASK = 'firebase-background-fetch';

let currentNotification: number | null = null;
let notificationId: string | null = null;
const notificationData: Omit<Readings, "location"> = {
  heartrate: 0,
  vibration: "",
  // spo2: 0
};

async function getNotification() {
  const data = (await get(ref(db, `/notifications/${currentNotification}`))).val().latestReadings;

  if (!data || !data.latestReadings)
    return;

  if (data.heartrate != notificationData.heartrate ||
    // data.spo2 != notificationData.spo2 ||
    data.vibration != notificationData.vibration
  ) {
    notificationData.heartrate = data.heartrate;
    // notificationData.spo2 = data.spo2;
    notificationData.vibration = data.vibration;

    Notifications.scheduleNotificationAsync({
      identifier: "danger",
      content: {
        title: "There is a meltdown",
        body: `HR: ${data.heartrate} | ${data.vibration} Meltdown`,
        // body: `HR: ${data.heartrate} | SpO2: ${data.spo2} | ${data.vibration} Meltdown`,
        color: "#f00"
      },
      trigger: {
        channelId: 'danger_notification',
      },
    });
  }
}

TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
  try {
    console.log("running background func", new Date().toISOString());

    const dbRef = ref(db, '/currentNotification');
    const snapshot = await get(dbRef);
    const data = snapshot.val();

    if (currentNotification != data) {
      console.log('background current changed');

      currentNotification = data;

      if (data == 0 && notificationId != null) {
        Notifications.dismissNotificationAsync(notificationId);
        notificationId = null;
      } else {
        getNotification();
      }

    } else {
      getNotification();
    }

    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    console.error('Background fetch error:', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

async function registerBackgroundFetchAsync() {
  return BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
    minimumInterval: 60 * 2,
    stopOnTerminate: false,
    startOnBoot: true,
  });
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: true,
  }),
});

export const NotificationProvider = ({ children }: NotificationProviderProps) => {
  const notificationId = useRef<string | null>(null);
  const currentNotification = useRef<number | null>(null);

  const unsubscribeListenToCurrentNotification = useRef<Unsubscribe | null>(null);
  const unsubscribeListenToNotification = useRef<Unsubscribe | null>(null);

  async function listenToNotification() {
    unsubscribeListenToNotification.current = onValue(ref(db, `/notifications/${currentNotification.current}`), async snapshot => {
      console.log("notification", snapshot.val());
      if (!snapshot.val() || !snapshot.val().latestReadings)
        return;

      const value: Omit<Readings, "location"> = snapshot.val().latestReadings;

      notificationId.current = await Notifications.scheduleNotificationAsync({
        identifier: "danger",
        content: {
          title: "There is a meltdown",
          body: `HR: ${value.heartrate} | ${value.vibration} Meltdown`,
          // body: `HR: ${value.heartrate} | SpO2: ${value.spo2} | ${value.vibration} Meltdown`,
          color: "#f00"
        },
        trigger: {
          channelId: 'danger_notification',
        },
      });
    });
  }

  async function listenToCurrentNotification() {
    unsubscribeListenToCurrentNotification.current = onValue(ref(db, 'currentNotification'), snapshot => {
      console.log("curr notification", snapshot.val(), notificationId.current);
      const val = snapshot.val();
      currentNotification.current = val;
      
      if (unsubscribeListenToNotification.current) {
        unsubscribeListenToNotification.current();
      }
      
      if (val == 0 && notificationId.current != null) {
        Notifications.dismissNotificationAsync(notificationId.current);
      } else {

        listenToNotification();
      }
    });
  }

  useEffect(() => {
    listenToCurrentNotification();

    registerBackgroundFetchAsync().then(() => {
      console.log('Background fetch registered');
    });
    
    return () => {
      if (unsubscribeListenToNotification.current)
        unsubscribeListenToNotification.current();

      if (unsubscribeListenToCurrentNotification.current)
        unsubscribeListenToCurrentNotification.current();
    }
  }, []);

  return (
    <NotificationContext.Provider value={{}}>
      {children}
    </NotificationContext.Provider>
  );
};