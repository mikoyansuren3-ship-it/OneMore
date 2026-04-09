import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  Platform,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";
import { colors } from "../../constants/colors";
import { fontFamily, fontSize } from "../../constants/typography";
import { spacing, radii } from "../../constants/spacing";
import { useStore } from "../../store/useStore";
import { PartnerBusiness } from "../../types";
import { MapPinIcon } from "../../components/icons/TabIcons";

const CATEGORIES = ["All", "Food & Drink", "Shopping", "Gas", "Fitness"] as const;
type Category = (typeof CATEGORIES)[number];

const categoryMap: Record<string, Category[]> = {
  cafe: ["Food & Drink"],
  restaurant: ["Food & Drink"],
  grocery: ["Food & Drink", "Shopping"],
  gas: ["Gas"],
  retail: ["Shopping"],
  fitness: ["Fitness"],
};

const categoryIcons: Record<string, string> = {
  cafe: "☕",
  restaurant: "🍽️",
  grocery: "🛒",
  gas: "⛽",
  retail: "🛍️",
  fitness: "💪",
};

const DEFAULT_REGION = {
  latitude: 37.41,
  longitude: -122.12,
  latitudeDelta: 0.08,
  longitudeDelta: 0.08,
};

function PartnerCard({ partner }: { partner: PartnerBusiness }) {
  const handleDirections = () => {
    const scheme = Platform.select({ ios: "maps:", android: "geo:" });
    const url = Platform.select({
      ios: `maps:?daddr=${partner.latitude},${partner.longitude}`,
      android: `geo:${partner.latitude},${partner.longitude}?q=${partner.latitude},${partner.longitude}(${partner.name})`,
    });
    if (url) Linking.openURL(url);
  };

  return (
    <TouchableOpacity style={pStyles.card} activeOpacity={0.7} onPress={handleDirections}>
      <View style={pStyles.iconWrap}>
        <Text style={pStyles.categoryIcon}>{categoryIcons[partner.category]}</Text>
      </View>
      <View style={pStyles.info}>
        <View style={pStyles.nameRow}>
          <Text style={pStyles.name} numberOfLines={1}>{partner.name}</Text>
          {partner.isDoubleImpact && (
            <View style={pStyles.diBadge}>
              <Text style={pStyles.diText}>2× Impact</Text>
            </View>
          )}
        </View>
        <Text style={pStyles.address} numberOfLines={1}>{partner.address}</Text>
        <Text style={pStyles.cta}>Tap for directions</Text>
      </View>
      <Text style={pStyles.distance}>{partner.distance}</Text>
    </TouchableOpacity>
  );
}

const pStyles = StyleSheet.create({
  card: {
    flexDirection: "row", alignItems: "center", backgroundColor: colors.cream,
    borderRadius: radii.lg, padding: spacing.md, marginBottom: spacing.sm,
    borderWidth: 1, borderColor: colors.paleGreen,
  },
  iconWrap: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: colors.deepGreen,
    justifyContent: "center", alignItems: "center", marginRight: spacing.sm + 2,
  },
  categoryIcon: { fontSize: 20 },
  info: { flex: 1, marginRight: spacing.sm },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 2 },
  name: { fontFamily: fontFamily.bodySemiBold, fontSize: fontSize.md, color: colors.bark, flexShrink: 1 },
  diBadge: { backgroundColor: "rgba(201,168,76,0.15)", paddingHorizontal: 6, paddingVertical: 2, borderRadius: radii.sm },
  diText: { fontFamily: fontFamily.bodySemiBold, fontSize: 9, color: colors.gold, textTransform: "uppercase", letterSpacing: 0.5 },
  address: { fontFamily: fontFamily.body, fontSize: fontSize.xs, color: colors.earth, marginBottom: 3 },
  cta: { fontFamily: fontFamily.bodySemiBold, fontSize: fontSize.xs, color: colors.brightGreen },
  distance: { fontFamily: fontFamily.bodySemiBold, fontSize: fontSize.sm, color: colors.sage },
});

export default function ExploreScreen() {
  const { partners } = useStore();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<Category>("All");
  const [region, setRegion] = useState(DEFAULT_REGION);
  const mapRef = useRef<MapView>(null);
  const searchRef = useRef<TextInput>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        setRegion({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          latitudeDelta: 0.06,
          longitudeDelta: 0.06,
        });
      }
    })();
  }, []);

  const filtered = partners
    .filter((p) => {
      const q = search.toLowerCase();
      if (q && !p.name.toLowerCase().includes(q) && !p.category.includes(q))
        return false;
      if (category !== "All" && !categoryMap[p.category]?.includes(category))
        return false;
      return true;
    })
    .sort((a, b) => a.distanceValue - b.distanceValue);

  const recenter = () => {
    mapRef.current?.animateToRegion(region, 500);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Explore Partners</Text>
        {/* Task 5: Enhanced search bar */}
        <View style={styles.searchWrap}>
          <TextInput
            ref={searchRef}
            style={styles.searchInput}
            placeholder="Search partners..."
            placeholderTextColor={colors.sage}
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
            onSubmitEditing={() => searchRef.current?.blur()}
          />
          {search.length > 0 && (
            <TouchableOpacity
              style={styles.clearBtn}
              onPress={() => { setSearch(""); searchRef.current?.blur(); }}
              hitSlop={8}
            >
              <Text style={styles.clearBtnText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Task 4: Real MapView */}
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          region={region}
          onRegionChangeComplete={setRegion}
          showsUserLocation
          showsMyLocationButton={false}
        >
          {partners.map((p) => (
            <Marker
              key={p.id}
              coordinate={{ latitude: p.latitude, longitude: p.longitude }}
              pinColor={p.isDoubleImpact ? colors.gold : colors.brightGreen}
            >
              <Callout tooltip>
                <View style={styles.callout}>
                  <Text style={styles.calloutName}>{p.name}</Text>
                  <Text style={styles.calloutDist}>{p.distance}</Text>
                  {p.isDoubleImpact && (
                    <Text style={styles.calloutBadge}>2× IMPACT</Text>
                  )}
                </View>
              </Callout>
            </Marker>
          ))}
        </MapView>
        <TouchableOpacity style={styles.recenterBtn} onPress={recenter}>
          <MapPinIcon size={18} color={colors.white} />
        </TouchableOpacity>
      </View>

      {/* Filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersRow}
        style={styles.filtersScroll}
      >
        {CATEGORIES.map((c) => (
          <TouchableOpacity
            key={c}
            style={[styles.chip, category === c && styles.chipActive]}
            onPress={() => setCategory(c)}
          >
            <Text style={[styles.chipText, category === c && styles.chipTextActive]}>
              {c}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Partners list */}
      <FlatList
        data={filtered}
        keyExtractor={(p) => p.id}
        renderItem={({ item }) => <PartnerCard partner={item} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MapPinIcon size={48} color={colors.paleGreen} />
            <Text style={styles.emptyTitle}>No partners found</Text>
            <Text style={styles.emptySubtext}>
              {search
                ? `No results for "${search}"`
                : "Try adjusting your category filter"}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.warmWhite },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  title: { fontFamily: fontFamily.display, fontSize: fontSize["3xl"], color: colors.bark, marginBottom: spacing.sm },
  searchWrap: { marginBottom: spacing.md, position: "relative" },
  searchInput: {
    backgroundColor: colors.cream, borderRadius: radii.md,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 2, paddingRight: 40,
    fontFamily: fontFamily.body, fontSize: fontSize.md, color: colors.bark,
    borderWidth: 1, borderColor: colors.paleGreen,
  },
  clearBtn: {
    position: "absolute", right: 12, top: 0, bottom: 0,
    justifyContent: "center", alignItems: "center",
  },
  clearBtnText: {
    fontFamily: fontFamily.bodySemiBold, fontSize: 16, color: colors.sage,
  },
  mapContainer: {
    marginHorizontal: spacing.lg, height: 200, borderRadius: radii.lg,
    overflow: "hidden", marginBottom: spacing.sm,
  },
  map: { flex: 1 },
  recenterBtn: {
    position: "absolute", bottom: 10, right: 10,
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.brightGreen,
    justifyContent: "center", alignItems: "center",
    shadowColor: colors.black, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25, shadowRadius: 4, elevation: 4,
  },
  callout: {
    backgroundColor: colors.forest, borderRadius: radii.sm,
    padding: spacing.sm, minWidth: 140,
  },
  calloutName: { fontFamily: fontFamily.bodySemiBold, fontSize: fontSize.sm, color: colors.white },
  calloutDist: { fontFamily: fontFamily.body, fontSize: fontSize.xs, color: colors.sage, marginTop: 1 },
  calloutBadge: {
    fontFamily: fontFamily.bodySemiBold, fontSize: 9, color: colors.gold,
    marginTop: 3, textTransform: "uppercase", letterSpacing: 0.5,
  },
  filtersScroll: { flexGrow: 0 },
  filtersRow: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, gap: spacing.sm },
  chip: {
    paddingHorizontal: spacing.md, paddingVertical: spacing.xs + 2,
    borderRadius: radii.full, backgroundColor: colors.cream,
    borderWidth: 1, borderColor: colors.paleGreen,
  },
  chipActive: { backgroundColor: colors.brightGreen, borderColor: colors.brightGreen },
  chipText: { fontFamily: fontFamily.bodySemiBold, fontSize: fontSize.sm, color: colors.earth },
  chipTextActive: { color: colors.white },
  listContent: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.xxl },
  emptyState: { alignItems: "center", paddingVertical: spacing.xxl, gap: spacing.sm },
  emptyTitle: { fontFamily: fontFamily.bodySemiBold, fontSize: fontSize.lg, color: colors.bark },
  emptySubtext: { fontFamily: fontFamily.body, fontSize: fontSize.sm, color: colors.earth, textAlign: "center" },
});
