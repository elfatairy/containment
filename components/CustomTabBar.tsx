import { Pressable, Text, View } from "react-native";
import { TabList, TabSlot, TabTrigger, Tabs, useTabSlot } from "expo-router/ui";
import React, { ComponentProps, ReactElement, ReactNode, useEffect, useState } from "react";
import { Octicons } from "@expo/vector-icons";
import { Href, Route, Router, RouteSegments, usePathname, useSegments } from "expo-router";
import { useTranslation } from "react-i18next";

export type CustomTabProps = {
    name: string,
    href: Route,
    Icon: ReactNode,
    ActiveIcon: ReactNode,
    showTabBar: boolean
}

export function CustomTabBar({ tabs }: { tabs: CustomTabProps[] }) {
    const [width, setWidth] = useState(0);
    const { i18n: { language } } = useTranslation();
    const path = usePathname();

    return (
        <Tabs>
            <TabSlot />
            <TabList onLayout={(e) => { setWidth(e.nativeEvent.layout.width) }} style={[{
                position: "absolute",
                bottom: 25,
                borderRadius: 34,
                gap: 15,
                transform: width ? `translateX(-${Math.floor(width / 2)}px)` : '',
                opacity: Number(tabs.find(tab => tab.href == path)?.showTabBar) ?? 1,
                paddingVertical: 3,
                paddingHorizontal: 20,
                backgroundColor: "#fff",
                alignItems: 'center',
                elevation: 1
            },
            language == 'ar-EG' ? {
                right: "50%",
                flexDirection: "row-reverse"
            } : {
                left: "50%",
                flexDirection: "row"
            }
            ]}>
                {
                    tabs && tabs.map(({ name, href, Icon, ActiveIcon }) => <TabTrigger name={name} href={href} key={name} style={{
                        padding: 14,
                        borderRadius: "50%",
                        aspectRatio: 1,
                        height: 'auto',
                        alignItems: 'center'
                    }}>
                        {path == href ? ActiveIcon : Icon}
                    </TabTrigger>)
                }
            </TabList>
        </Tabs>
    );
}