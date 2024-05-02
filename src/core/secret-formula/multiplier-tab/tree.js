/* eslint-disable max-depth */
/* eslint-disable camelcase */
import { MultiplierTabHelper } from "./helper-functions";
import { multiplierTabValues } from "./values";

const dynamicGenProps = ["TP", "DT", "tickspeed", "infinities", "eternities", "gamespeed", "replicanti"];
const propList = {
  AD: ["purchase", "dimboost", "sacrifice", "achievementMult", "achievement", "infinityUpgrade",
    "breakInfinityUpgrade", "infinityPower", "infinityChallenge", "timeStudy", "eternityChallenge", "glyph", "v",
    "alchemy", "pelle", "iap", "effectNC", "nerfIC", "nerfV", "nerfCursed", "cursedRow", "nerfPelle"],
  ID: ["purchase", "achievementMult", "achievement", "replicanti", "infinityChallenge", "timeStudy", "eternityUpgrade",
    "eternityChallenge", "glyph", "alchemy", "imaginaryUpgrade", "pelle", "iap", "nerfV", "nerfCursed", "nerfPelle"],
  TD: ["purchase", "achievementMult", "achievement", "timeStudy", "eternityUpgrade", "eternityChallenge",
    "dilationUpgrade", "realityUpgrade", "glyph", "alchemy", "cursedRow12", "imaginaryUpgrade", "pelle", "iap", "nerfV", "nerfCursed"],
  IP: ["base", "infinityUpgrade", "achievement", "timeStudy", "dilationUpgrade", "glyph", "alchemy", "pelle", "iap",
    "nerfTeresa", "nerfV", "cursedRow"],
  EP: ["base", "eternityUpgrade", "achievement", "timeStudy", "glyph", "realityUpgrade", "pelle", "iap", "nerfTeresa", "nerfV"],
};

// Some of the props above would contain every entry except "total" in their respective value GameDB entry, so we
// generate them dynamically instead
for (const prop of dynamicGenProps) {
  propList[prop] = [];
  for (const toCopy of Object.keys(multiplierTabValues[prop])) {
    if (toCopy !== "total") propList[prop].push(toCopy);
  }
}

// Used for individual dimension breakdowns of effects (eg. full achievement mult into its values on individual ADs)
// Results in an array of ["key_1", "key_2", ... , "key_8"]
function append8(key) {
  const props = [];
  for (let dim = 1; dim <= 8; dim++) props.push(`${key}_${dim}`);
  return props;
}

// Helper method to create very long lists of entries in the tree; format is "RESOURCE_SOURCE_DIMENSION"
function getProps(resource, tier) {
  const props = propList[resource].map(s => `${resource}_${s}`);
  if (!tier) return props;
  const newProps = [];
  for (const effect of props) newProps.push(`${effect}_${tier}`);
  return newProps;
}

// Everything in multiplierTabTree is associated with values in multiplierTabValues. The only explicitly
// initialized props here are the "root" props which are viewable on the tab with full breakdowns. After the initial
// specification, all children props are dynamically added based on the arrays in the helper functions above
export const multiplierTabTree = {
  AM_total: [
    ["AD_total", "tickspeed_total", "AM_effarigAM"]
  ],
  AD_total: [
    getProps("AD"),
    append8("AD_total")
  ],
  ID_total: [
    getProps("ID"),
    append8("ID_total")
  ],
  TD_total: [
    getProps("TD"),
    append8("TD_total")
  ],
  IP_total: [
    getProps("IP")
  ],
  IP_base: [
    ["IP_antimatter", "IP_divisor"]
  ],
  EP_total: [
    getProps("EP")
  ],
  EP_base: [
    ["EP_IP", "EP_divisor"]
  ],
  TP_total: [
    getProps("TP")
  ],
  DT_total: [
    getProps("DT")
  ],
  tickspeed_total: [
    ["tickspeed_achievement", "tickspeed_upgrades", "tickspeed_galaxies", "tickspeed_pelleTickspeedPow"]
  ],
  tickspeed_upgrades: [
    ["tickspeedUpgrades_purchased", "tickspeedUpgrades_fromShards", "tickspeedUpgrades_fromAchievements"]
  ],
  tickspeed_galaxies: [
    ["galaxies_antimatter", "galaxies_replicanti", "galaxies_tachyon", "galaxies_nerfPelle"]
  ],
  infinities_total: [
    getProps("infinities")
  ],
  eternities_total: [
    getProps("eternities")
  ],
  gamespeed_total: [
    getProps("gamespeed")
  ],
  replicanti_total: [
    getProps("replicanti")
  ],
};

// Gamespeed's two alternate displays are current and average gamespeed, distinguished by which of two
// mutually-exclusive entries appear in the list. We explicity modify props here as needed
const allGamespeed = multiplierTabTree.gamespeed_total[0];
multiplierTabTree.gamespeed_total[0] = [...allGamespeed].filter(key => key !== "gamespeed_blackHoleAvg");
multiplierTabTree.gamespeed_total[1] = [...allGamespeed].filter(key => key !== "gamespeed_blackHoleCurr");

// DT doesn't explicitly have an entry to TP, due to it being its own total entry, so we link them together
multiplierTabTree.DT_total[0].unshift("TP_total");

// Additional data specification for dynamically-generated props
const dimTypes = ["AD", "ID", "TD"];
const singleRes = ["IP", "EP", "DT", "tickspeed", "infinities", "eternities", "replicanti"];
const targetedEffects = {
  achievement: { 
    // Enhanced Achievements will be placed here as (10000 + actual number)
    // to distinguish them from the regular achievements, and 
    // 1000/2000 + actual number for when they have more than 1 effect to keep track of
    // -row only when neccesary (-3) (cursed rows)
    checkFn: MultiplierTabHelper.achievementDimCheck,
    AD: [23, 10023, 24, 10024, 28, 10028, 31, 10031, 34, 10034, 35, 10035, 38, 10038, 42, 10042, 43, 10043, 
      44, 10044, 46, 10046, 47, 10047, 48, 10048, 56, 10056, 64, 10064, 65, 10065, 67, 10067, 68, 10068, 
      71, 10071, 72, 10072, 73, 10073, 74, 10074, 76, 10076, 84, 10084, 91, 92, 101, 10101, 183],
    ID: [10035, 48, 10048, 10067, 10074, 10076, 10091, 1094, 11094, 10101, 107, 10107, 124, 10124],
    TD: [10035, 48, 10048, 10051, 10067, 10074, 10076, 10092, 105, 10105, 112, 10112, 123, 10123, 128, 10128],
    IP: [62, 10062, 77, 10077, 85, 10085, 93, 10093, 116, 10116, 125, 10125, 141],
    EP: [10085, 10102, 10116, 153],
    DT: [132, 10132, 137, 10137],
    tickspeed: [-3, 36, 10036, 45, 10045, 66, 10066, 10118, 135],
    infinities: [33, 10033, 87, 10087, 10102, 131, 164, 172],
    eternities: [10037, 10102, 113, 10113, 10115],
    replicanti: [2094, 12094, 10095, 106, 10106, 108, 10108, 134, 10134]
  },
  timeStudy: {
    checkFn: MultiplierTabHelper.timeStudyDimCheck,
    AD: [71, 91, 101, 161, 193, 214, 234],
    ID: [72, 82, 92, 102, 162],
    TD: [11, 73, 93, 103, 151, 221, 227, 301],
    IP: [41, 51, 141, 142, 143],
    EP: [61, 121, 122, 123],
    replicanti: [62, 132, 213],
  },
  infinityChallenge: {
    checkFn: MultiplierTabHelper.ICDimCheck,
    AD: [3, 4, 8],
    ID: [1, 6],
  },
  eternityChallenge: {
    checkFn: MultiplierTabHelper.ECDimCheck,
    ID: [2, 4, 9],
    TD: [1, 10],
  },
  cursedRow: {
    checkFn: MultiplierTabHelper.cursedRowDimCheck,
    AD: [4, 6],
    IP: [7],
    replicanti: [10],
  }
};

// Highest actively-producing dimensions need a special case
for (const dim of dimTypes) {
  multiplierTabTree[`${dim}_total`][0].push(`${dim}_highestDim`);
  multiplierTabTree[`${dim}_total`][1].push(`${dim}_highestDim`);
}

// EC7 also needs a special case for tickspeed, since it doesn't appear on the multipliers themselves
for (const dim of ["ID", "TD"]) {
  multiplierTabTree[`${dim}_total`][0].push(`${dim}_tickspeed`);
  multiplierTabTree[`${dim}_total`][1].push(`${dim}_tickspeed`);
}

// Dynamically generate all values from existing values, but broken down by dimension
for (const res of dimTypes) {
  for (const prop of getProps(res)) multiplierTabTree[prop] = [append8(prop)];
  for (let dim = 1; dim <= 8; dim++) multiplierTabTree[`${res}_total_${dim}`] = [getProps(res, dim)];
}

// A few dynamically-generated props are largely useless in terms of what they connect to, in that they have very few
// entries or have 8 identical entries, so we explicitly remove those lists for a cleaner appearance on the UI
const removedRegexes = ["AD_sacrifice", "AD_breakInfinityUpgrade", "AD_nerfIC", "AD_infinityUpgrade", "AD_v",
  "ID_replicanti", "ID_infinityChallenge", "ID_eternityUpgrades",
  "TD_achievement", "TD_eternityUpgrade", "TD_dilationUpgrade", "TD_realityUpgrade", "TD_cursedRow12",
  ".._achievementMult", ".._glyph", ".._alchemy", ".._imaginaryUpgrade", ".._iap",
  ".._nerfV", ".._nerfCursed", ".._nerfPelle", ".._pelle"
];
const removedProps = Object.keys(multiplierTabTree)
  .filter(key => removedRegexes.some(regex => key.match(regex)));
for (const prop of removedProps) {
  multiplierTabTree[prop] = undefined;
}

// We need to handle infinity power multiplier a bit differently; previous steps of dynamic generation fill it with
// 8 identical AD multipliers, but we want to replace it with ID mults and the conversion rate
multiplierTabTree.AD_infinityPower = [["ID_total", "ID_powerConversion"]];
for (let dim = 1; dim <= 8; dim++) {
  multiplierTabTree[`AD_infinityPower_${dim}`] = [["ID_total", "ID_powerConversion"]];
}

// Tesseracts are added one layer deep, but we don't want to override the existing ID_purchase entry
multiplierTabTree.ID_purchase.unshift(["ID_basePurchase", "ID_tesseractPurchase",
  "ID_infinityGlyphSacrifice", "ID_powPurchase"]);
for (let dim = 1; dim <= 7; dim++) {
  multiplierTabTree[`ID_purchase_${dim}`] = [[`ID_basePurchase_${dim}`, `ID_tesseractPurchase_${dim}`,
    "ID_powPurchase"]];
}
multiplierTabTree.ID_purchase_8 = [[`ID_basePurchase_8`, `ID_infinityGlyphSacrifice`, "ID_powPurchase"]];

// These are also added one layer deep
for (let dim = 1; dim <= 7; dim++) {
  multiplierTabTree[`TD_purchase_${dim}`] = [[`TD_basePurchase_${dim}`, `TD_powPurchase_${dim}`]];
}
multiplierTabTree.TD_purchase.push(["TD_basePurchase", "TD_timeGlyphSacrifice", "TD_powPurchase"]);
multiplierTabTree.TD_purchase_8 = [["TD_basePurchase_8", "TD_timeGlyphSacrifice", "TD_powPurchase"]];

// Dynamically fill effects which only affect certain dimensions, as noted in targetedEffects
for (const res of dimTypes) {
  for (const eff of Object.keys(targetedEffects)) {
    if (!targetedEffects[eff][res]) continue;
    multiplierTabTree[`${res}_${eff}`] = [[]];
    for (const id of targetedEffects[eff][res]) {
      for (let dim = 1; dim <= 8; dim++) {
        const propStr = `${res}_${eff}_${dim}`;
        const dimStr = `${res}${dim}`;
        if (targetedEffects[eff].checkFn(id, dimStr)) {
          if (!multiplierTabTree[propStr]) multiplierTabTree[propStr] = [[]];
          multiplierTabTree[propStr][0].push(`general_${eff}_${id}_${dimStr}`);
        }
      }
      multiplierTabTree[`${res}_${eff}`][0].push(`general_${eff}_${id}_${res}`);
    }
  }
}

// Dynamically fill effects which affect single resources as well
for (const res of singleRes) {
  for (const eff of Object.keys(targetedEffects)) {
    if (!targetedEffects[eff][res]) continue;
    multiplierTabTree[`${res}_${eff}`] = [[]];
    for (const ach of targetedEffects[eff][res]) {
      multiplierTabTree[`${res}_${eff}`][0].push(`general_${eff}_${ach}`);
    }
  }
}

// Fill in eternity upgrade entries
multiplierTabTree.ID_eternityUpgrade = [[`ID_eu1`, `ID_eu2`, `ID_eu3`]];
multiplierTabTree.TD_eternityUpgrade = [[`TD_eu1`, `TD_eu2`]];
for (let dim = 1; dim <= 8; dim++) {
  multiplierTabTree[`ID_eternityUpgrade_${dim}`] = [[`ID_eu1_${dim}`, `ID_eu2_${dim}`, `ID_eu3_${dim}`]];
  multiplierTabTree[`TD_eternityUpgrade_${dim}`] = [[`TD_eu1_${dim}`, `TD_eu2_${dim}`]];
}
