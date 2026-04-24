import { Platform } from "react-native";

export const COLORS = {
  bg0: "transparent",
  bg1: "#0d0a04",
  bg2: "#141008",
  bg3: "#1c1509",
  bg4: "#251c0c",
  bg5: "#2e2410",

  gold1: "#fdf0b0",
  gold2: "#f5c842",
  gold3: "#cc9a20",
  gold4: "#8a6510",
  gold5: "#3a2a06",

  textPrimary: "#f0e4c8",
  textSub: "#b09a70",
  textDim: "#7a6845",
  textGold: "#f5c842",

  red: "#c0392b",
  redLight: "#e74c3c",
  redDark: "#3b0000",
  purple: "#8e44ad",
  purpleLight: "#9b59b6",
  blue: "#2471a3",
  blueLight: "#2e86c1",
  green: "#1e8449",
  greenLight: "#27ae60",

  rarityCommon: "#8a8a8a",
  rarityUncommon: "#27ae60",
  rarityRare: "#2e86c1",
  rarityEpic: "#9b59b6",
  rarityLegendary: "#f5c842",

  branchCommerce: "#f5c842",
  branchMilitary: "#c0392b",
  branchFaith: "#8e44ad",
  branchLineage: "#2471a3",
};

export const FONTS = {
  serif: Platform.OS === "ios" ? "Georgia" : "serif",
  mono: Platform.OS === "ios" ? "Courier New" : "monospace",
  system: Platform.OS === "ios" ? "System" : "Roboto",
};

export const SPACE = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };
export const RADIUS = { sm: 4, md: 8, lg: 12, xl: 16, round: 999 };

export const SHADOWS = {
  goldGlow: {
    shadowColor: COLORS.gold2,
    shadowOpacity: 0.5,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
    elevation: 12,
  },
  cardLift: {
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
};

export const Palette = {
  bg: COLORS.bg2,
  card: COLORS.bg3,
  cardAlt: COLORS.bg4,
  border: COLORS.bg5,
  gold: COLORS.gold2,
  goldDeep: COLORS.gold3,
  textPrimary: COLORS.textPrimary,
  textSecondary: COLORS.textSub,
  textDim: COLORS.textDim,
  textMuted: COLORS.textSub,
  prestigeBg: "#2a1500",
  prestigeBorder: COLORS.gold3,
};

export const BRANCH_COLORS = {
  commerce: COLORS.branchCommerce,
  military: COLORS.branchMilitary,
  faith: COLORS.branchFaith,
  lineage: COLORS.branchLineage,
};

export const BRANCH_LABELS = {
  commerce: "Commerce",
  military: "Military",
  faith: "Faith",
  lineage: "Lineage",
};
