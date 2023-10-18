import { DC } from "../../constants";

import { MultiplierTabIcons } from "./icons";

// See index.js for documentation
export const replicanti = {
  total: {
    name: "Replicanti Speed",
    multValue: () => totalReplicantiSpeedMult(Replicanti.amount.gt(replicantiCap())),
    isActive: () => PlayerProgress.eternityUnlocked(),
    overlay: ["Ξ"],
  },
  achievement: {
    name: "Achievement Rewards",
    // r108 doesn't have an effectCondition, so it must be explicit here, and
    // r134 is explicitly 2 in the replicanti code as well, inside of a replicanti amount check (for some reason)
    multValue: () => {
      let totalMult = DC.D1;
      totalMult  = totalMult.timesEffectsOf(
        Achievement(94).effects.replicantiSpeed,
        Achievement(94).enhancedEffect.effects.replicantiSpeed, 
        Achievement(95).enhancedEffect,
        Achievement(106)
      );
      if (Time.thisEternity.totalSeconds < 9 || Achievement(145).canBeApplied) {
        totalMult = totalMult.timesEffectOf(Achievement(108).effects.replicantiSpeed);
      }
      if (Replicanti.amount.lte(replicantiCap())) totalMult  = totalMult.timesEffectOf(Achievement(134));
      return totalMult;
    },
    isActive: () => [94, 106, 108, 134].some(a => Achievement(a).canBeApplied || Achievement(a).isEnhanced),
    icon: MultiplierTabIcons.ACHIEVEMENT,
  },
  timeStudy: {
    name: "Time Studies",
    multValue: () => {
      const preReality = Effects.product(TimeStudy(62), TimeStudy(213));
      return preReality * (Perk.studyPassive.isBought && TimeStudy(132).isBought ? 3 : 1);
    },
    isActive: () => PlayerProgress.eternityUnlocked() && !Pelle.isDoomed,
    icon: MultiplierTabIcons.TIME_STUDY,
  },
  glyph: {
    name: "Glyph Effects",
    multValue: () => {
      const baseEffect = (Pelle.isDoomed ? DC.D1 : getAdjustedGlyphEffect("replicationspeed"))
        .times(Pelle.specialGlyphEffect.replication);
      const alteredEffect = Math.clampMin(
        Decimal.log10(Replicanti.amount) * getSecondaryGlyphEffect("replicationdtgain"), 1);
      return GlyphAlteration.isAdded("replication") ? baseEffect.times(alteredEffect) : baseEffect;
    },
    isActive: () => PlayerProgress.realityUnlocked() && (!Pelle.isDoomed || Pelle.specialGlyphEffect.replication > 1),
    icon: MultiplierTabIcons.GENERIC_GLYPH,
  },
  amplifierRep: {
    name: "Reality Upgrade - Replicative Amplifier",
    multValue: () => RealityUpgrade(2).effectOrDefault(1),
    isActive: () => PlayerProgress.realityUnlocked() && !Pelle.isDoomed,
    icon: MultiplierTabIcons.UPGRADE("reality"),
  },
  realityUpgrade1: {
    name: "Reality Upgrade - Cosmically Duplicate",
    multValue: () => RealityUpgrade(6).effectOrDefault(1),
    isActive: () => PlayerProgress.realityUnlocked() && !Pelle.isDoomed,
    icon: MultiplierTabIcons.UPGRADE("reality"),
  },
  realityUpgrade2: {
    name: "Reality Upgrade - Replicative Rapidity",
    multValue: () => RealityUpgrade(23).effectOrDefault(1),
    isActive: () => PlayerProgress.realityUnlocked() && !Pelle.isDoomed,
    icon: MultiplierTabIcons.UPGRADE("reality"),
  },
  alchemy: {
    name: "Alchemy Resource - Replication",
    multValue: () => AlchemyResource.replication.effectOrDefault(1),
    isActive: () => Ra.unlocks.unlockGlyphAlchemy.canBeApplied && !Pelle.isDoomed,
    icon: MultiplierTabIcons.ALCHEMY,
  },
  ra: {
    name: "Ra Upgrade - Multiplier based on TT",
    multValue: () => Ra.unlocks.continuousTTBoost.effects.replicanti.effectOrDefault(1),
    isActive: () => Ra.unlocks.continuousTTBoost.isUnlocked,
    icon: MultiplierTabIcons.GENERIC_RA,
  },
  pelle: {
    name: "Pelle Strike - Decay Rift",
    multValue: () => PelleRifts.decay.effectValue,
    isActive: () => Pelle.isDoomed && PelleRifts.decay.effectValue.gt(1),
    icon: MultiplierTabIcons.PELLE,
  },
  iap: {
    name: "Shop Tab Purchases",
    multValue: () => ShopPurchase.replicantiPurchases.currentMult,
    isActive: () => ShopPurchaseData.totalSTD > 0 && ShopPurchase.replicantiPurchases.currentMult > 1,
    icon: MultiplierTabIcons.IAP,
  },
};
