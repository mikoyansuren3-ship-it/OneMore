import { Tabs } from "expo-router";
import { colors } from "../../constants/colors";
import { fontFamily, fontSize } from "../../constants/typography";
import {
  LeafIcon,
  GlobeIcon,
  MapPinIcon,
  TrophyIcon,
  PersonIcon,
} from "../../components/icons/TabIcons";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.forest,
          borderTopWidth: 0,
          height: 88,
          paddingBottom: 28,
          paddingTop: 12,
          shadowColor: colors.black,
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.15,
          shadowRadius: 12,
          elevation: 12,
        },
        tabBarActiveTintColor: colors.brightGreen,
        tabBarInactiveTintColor: "rgba(163,201,168,0.6)",
        tabBarLabelStyle: {
          fontFamily: fontFamily.body,
          fontSize: fontSize.xs,
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <LeafIcon size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="impact"
        options={{
          title: "Impact",
          tabBarIcon: ({ color }) => <GlobeIcon size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Explore",
          tabBarIcon: ({ color }) => <MapPinIcon size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="rewards"
        options={{
          title: "Rewards",
          tabBarIcon: ({ color }) => <TrophyIcon size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => <PersonIcon size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
