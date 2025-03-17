import { Entypo } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState } from "react"
import { useTranslation } from "react-i18next";
import { I18nManager, StyleSheet, Text, TouchableOpacity } from "react-native";
// import * as Updates from "expo-updates";

export default function LanguageToggle() {
    const { t, i18n: { language, changeLanguage } } = useTranslation();

    const toggleLanguage = () => {
        const newLanguage = language === "en-US" ? "ar-EG" : "en-US";
        changeLanguage(newLanguage);
        if (newLanguage == "ar-EG") {
            I18nManager.forceRTL(true);
        } else {
            I18nManager.forceRTL(false);
        }
    }

    return (
        <TouchableOpacity onPress={toggleLanguage} style={styles.toggleLangBtn}>
            <Entypo name="language" size={24} color="black" />
            <Text>{t("language")}</Text>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    toggleLangBtn: {
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 16,
        paddingVertical: 8,
        fontSize: 16,
        color: "#333",
        backgroundColor: "#fff",
        borderRadius: 4,
        borderWidth: 1,
        borderColor: "#ccc",
        flexDirection: 'row',
        justifyContent: 'center'
    }
})