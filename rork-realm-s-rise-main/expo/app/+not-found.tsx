import { Link, Stack } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { Palette } from "@/constants/colors";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Lost Realm" }} />
      <View style={styles.container}>
        <Text style={styles.title}>This path leads nowhere.</Text>
        <Text style={styles.sub}>Even kings lose their way.</Text>
        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Return to the Kingdom</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: Palette.bg,
  },
  title: {
    fontSize: 22,
    fontFamily: "Georgia",
    fontWeight: "700",
    color: Palette.gold,
  },
  sub: {
    fontFamily: "Georgia",
    fontStyle: "italic",
    color: Palette.textDim,
    marginTop: 6,
  },
  link: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 18,
    backgroundColor: Palette.card,
    borderWidth: 1,
    borderColor: Palette.goldMuted,
    borderRadius: 10,
  },
  linkText: {
    fontSize: 14,
    fontFamily: "Georgia",
    fontWeight: "700",
    color: Palette.gold,
  },
});
