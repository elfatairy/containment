
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";
import AsyncStorage from "@react-native-async-storage/async-storage";
import translationEn from "./locales/en-US.json";
import translationAr from "./locales/ar-EG.json";
import { I18nManager } from "react-native";

const resources = {
    "ar-EG": { translation: translationAr },
    "en-US": { translation: translationEn },
};

const initI18n = async () => {
    let savedLanguage = await AsyncStorage.getItem("language");

    if (!savedLanguage) {
        savedLanguage = Localization.locale;
    }

    if (savedLanguage == "ar-EG") {
        I18nManager.forceRTL(true);
    } else {
        I18nManager.forceRTL(false);
    }

    i18n.use(initReactI18next).init({
        resources,
        lng: savedLanguage,
        fallbackLng: "en-US",
        interpolation: {
            escapeValue: false,
        },
    });
};

initI18n();

export default i18n;