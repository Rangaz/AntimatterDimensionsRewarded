import { DC } from "../../constants";

import { MultiplierTabHelper } from "./helper-functions";
import { MultiplierTabIcons } from "./icons";

// See index.js for documentation
export const general = {
  achievement: { // Enhanced effects are 10000 + actual achievement number
    // If an Achievement has more than 1 effect they may be labelled as
    // 1000/2000 + number. Those are special cases.
    // -row for Cursed Rows, 
    name: (ach, dim) => { 
      let name
      if (ach < 0) {
        name = "Cursed Row ".concat(-ach);
        return dim?.length === 2
          ? name.concat(" (", dim, ")")
          : name
      }
      name = ach > 10000 ? "Enhanced Achievement " : "Achievement ";
      // We only want the first 3 digits of ach. We essentially substract ach
      // by almost itself, cancelling out everything but the 3 digits.
      ach -= Math.floor(ach / 1000) * 1000;
      name = name.concat(ach);
      return dim?.length === 2
      ? name.concat(" (", dim, ")")
      : name},
    multValue: (ach, dim) => {
      // If it's a cursed row...
      // While most cursed rows will be placed in their own category, I'll cheat and
      // include cursed row 3 here to not complicate the Tickspeed section
      if (ach < 0) {
        ach *= -1;
        // Cursed row 3 is a Tickspeed divisor.
        if (ach === 3) return CursedRow(ach).canBeApplied ? 
            DC.D1.divide(CursedRow(ach).effectOrDefault(1)) : 1
      }

      // If it's an enhanced effect...
      if (ach > 10000) {
        ach -= 10000;

        // Handle those with multiple effects
        if (ach === 1094) return Achievement(94).enhancedEffect.effects.infinityPowerGain.effectOrDefault(1);
        if (ach === 2094) return Achievement(94).enhancedEffect.effects.replicantiSpeed.effectOrDefault(1);

        if (ach === 47 || ach === 72 || ach === 93) return 1; // Power effect
        if (ach === 102) return Achievement(102).enhancedEffect.effects.multiplier.effectOrDefault(1);
        if (ach === 108) return Achievement(108).enhancedEffect.effects.replicantiSpeed.effectOrDefault(1);
        if (ach === 115) return Achievement(115).enhancedEffect.effects.eternityMultiplier.effectOrDefault(1);

        // The base tickspeed from achievements' effect is actually divisors, so 
        // we want to show the reciprocal instead
        if (ach === 36 || ach === 45 || ach === 66) {
          return Achievement(ach).enhancedEffect.canBeApplied ? 
            DC.D1.divide(Achievement(ach).enhancedEffect.effectOrDefault(1)) : 1
        }
        if (!dim) return Achievement(ach).enhancedEffect.canBeApplied ? 
          Achievement(ach).enhancedEffect.effectOrDefault(1) : 1;

        if (dim?.length === 2) {
          let totalEffect = DC.D1;
          for (let tier = 1; tier <= MultiplierTabHelper.activeDimCount(dim); tier++) {
            let singleEffect;
            if (ach === 43) singleEffect = Achievement(43).enhancedEffect.canBeApplied ? 
              DC.E250.pow(tier) : 1;
            else singleEffect = (MultiplierTabHelper.achievementDimCheck(ach + 10000, `${dim}${tier}`) &&
                Achievement(ach).enhancedEffect.canBeApplied) ? 
                Achievement(ach).enhancedEffect.effectOrDefault(1) : 1;
            totalEffect = totalEffect.times(singleEffect);
          }
          return totalEffect;
        }
        if (ach === 43) return Achievement(43).enhancedEffect.canBeApplied ? 
          DC.E250.pow(Number(dim.charAt(2))) : 1;

        return (MultiplierTabHelper.achievementDimCheck(ach, dim) && Achievement(ach).enhancedEffect.canBeApplied)
        ? Achievement(ach).enhancedEffect.effectOrDefault(1) : 1;
      }
      
      // For unenhanced achievements...
      // Handle those with multiple effects
      if (ach === 1094) return Achievement(94).effects.infinityPowerGain.effectOrDefault(1);
      if (ach === 2094) return Achievement(94).effects.replicantiSpeed.effectOrDefault(1);
      if (ach === 108) return Achievement(108).canBeApplied && (Time.thisEternity.totalSeconds < 9 
        || Achievement(145).canBeApplied) ? Achievement(108).effects.replicantiSpeed.effectOrDefault(1) : 1;
      // There is also a buy10 effect, but we don't track that in the multiplier tab
      if (ach === 141) return Achievement(141).canBeApplied ? Achievement(141).effects.ipGain.effectOrDefault(1) : 1;
      if (ach === 72 || ach === 183) return 1;
      if (ach === 36 || ach === 45 || ach === 66 || ach === 135) {
        return DC.D1.divide(Achievement(ach).effectOrDefault(1));
      }
      if (!dim) return Achievement(ach).canBeApplied ? Achievement(ach).effectOrDefault(1) : 1;

      if (dim?.length === 2) {
        let totalEffect = DC.D1;
        for (let tier = 1; tier <= MultiplierTabHelper.activeDimCount(dim); tier++) {
          let singleEffect;
          if (ach === 43) singleEffect = Achievement(43).canBeApplied ? (1 + tier / 100) : 1;
          else singleEffect = (MultiplierTabHelper.achievementDimCheck(ach, `${dim}${tier}`) &&
              Achievement(ach).canBeApplied) ? Achievement(ach).effectOrDefault(1) : 1;
          totalEffect = totalEffect.times(singleEffect);
        }
        return totalEffect;
      }

      if (ach === 43) return Achievement(43).canBeApplied ? (1 + Number(dim.charAt(2)) / 100) : 1;
      return (MultiplierTabHelper.achievementDimCheck(ach, dim) && Achievement(ach).canBeApplied)
        ? Achievement(ach).effectOrDefault(1) : 1;
    },
    // 183 is the only time a power effect is in an Achievement, so we special-case it here and return a x1 multiplier.
    // ...or that would be the case if it wasn't for my achievements (r72, Er47 & Er93).
    powValue: ach => {
      switch (ach) {
        case 183: return Achievement(183).effectOrDefault(1); 
        case 10047: return Achievement(47).enhancedEffect.effectOrDefault(1);
        case 72: return Achievement(72).effectOrDefault(1);
        case 10072: return Achievement(72).enhancedEffect.effectOrDefault(1);
        case 10093: return Achievement(93).enhancedEffect.effectOrDefault(1);
      }
    },
    isActive: ach => ach < 0 ? CursedRow(-ach).canBeApplied : (ach > 10000 ? Achievement(ach - Math.floor(ach / 1000) * 1000).enhancedEffect.canBeApplied : 
      Achievement(ach - Math.floor(ach / 1000) * 1000).canBeApplied),
    icon: ach => {
      const base = ach < 0 ? MultiplierTabIcons.CURSED_ROW : MultiplierTabIcons.ACHIEVEMENT;
      return {
        color: base.color,
        symbol: `${base.symbol}${ach < 0 ? -ach : ach - Math.floor(ach / 1000) * 1000}`,
      };
    },
  },
  timeStudy: {
    name: (ts, dim) => (dim?.length === 2
      ? `Time Study ${ts} (${dim})`
      : `Time Study ${ts}`),
    multValue: (ts, dim) => {
      // This is a special case for the passive path RG study, as its effect is 0.4 (for galaxy power) but
      // in the multiplier tab we only reference its replicanti speed value (which is 3)
      if (ts === 132) return TimeStudy(ts).canBeApplied ? 3 : 1;

      if (!dim) return TimeStudy(ts).canBeApplied ? TimeStudy(ts).effectOrDefault(1) : 1;
      if (dim?.length === 2) {
        let totalEffect = DC.D1;
        for (let tier = 1; tier <= MultiplierTabHelper.activeDimCount(dim); tier++) {
          totalEffect = totalEffect.times((MultiplierTabHelper.timeStudyDimCheck(ts, `${dim}${tier}`) &&
              TimeStudy(ts).isBought) ? TimeStudy(ts).effectOrDefault(1) : 1);
        }
        return totalEffect;
      }
      // The new Decimal() wrapper is necessary because, for some inexplicable reason, replicanti becomes
      // reactive through TS101 if that isn't there
      return (MultiplierTabHelper.timeStudyDimCheck(ts, dim) && TimeStudy(ts).isBought)
        ? new Decimal(TimeStudy(ts).effectOrDefault(1)) : 1;
    },
    isActive: ts => TimeStudy(ts).isBought,
    icon: ts => {
      const base = MultiplierTabIcons.TIME_STUDY;
      return {
        color: base.color,
        symbol: `${base.symbol}${ts}`,
      };
    },
  },
  infinityChallenge: {
    name: ic => `Infinity Challenge ${ic}`,
    displayOverride: ic => (ic === 4 ? formatPow(InfinityChallenge(4).reward.effectValue, 0, 3) : ""),
    multValue: (ic, dim) => {
      // We cheat here by actually giving IC4 a multiplier of a value equal to its effect on the final
      // value in order to represent its proportion accurately. It's hidden by displayOverride
      if (ic === 4) {
        const ic4Pow = InfinityChallenge(4).reward.effectValue;
        const mults = AntimatterDimensions.all.map(ad => ad.multiplier.pow((ic4Pow - 1) / ic4Pow));
        if (dim?.length === 2) return mults.reduce((x, y) => x.times(y), DC.D1);
        return mults[Number(dim.charAt(2)) - 1];
      }

      if (dim?.length === 2) {
        let totalEffect = DC.D1;
        for (let tier = 1; tier <= MultiplierTabHelper.activeDimCount(dim); tier++) {
          totalEffect = totalEffect.times((MultiplierTabHelper.ICDimCheck(ic, `${dim}${tier}`) &&
              InfinityChallenge(ic).isCompleted) ? InfinityChallenge(ic).reward.effectOrDefault(1) : 1);
        }
        return totalEffect;
      }
      const num = Number(dim.charAt(2));
      if (ic === 8) return (num > 1 && num < 8) ? InfinityChallenge(ic).reward.effectValue : DC.D1;
      return InfinityChallenge(ic).reward.effectValue;
    },
    isActive: ic => InfinityChallenge(ic).isCompleted,
    icon: ic => {
      const base = MultiplierTabIcons.CHALLENGE("infinity");
      return {
        color: base.color,
        symbol: `${base.symbol}${ic}`,
      };
    },
  },
  eternityChallenge: {
    name: ec => `Eternity Challenge ${ec}`,
    multValue: (ec, dim) => {
      if (dim?.length === 2) {
        let totalEffect = DC.D1;
        for (let tier = 1; tier <= MultiplierTabHelper.activeDimCount(dim); tier++) {
          totalEffect = totalEffect.times(
            (MultiplierTabHelper.ECDimCheck(ec, `${dim}${tier}`) && EternityChallenge(ec).reward.canBeApplied)
              ? EternityChallenge(ec).reward.effectOrDefault(1).clampMin(1)
              : 1);
        }
        return totalEffect;
      }
      if (ec === 2) return dim === "ID1" ? EternityChallenge(ec).reward.effectValue : DC.D1;
      return EternityChallenge(ec).reward.effectOrDefault(1);
    },
    isActive: ec => EternityChallenge(ec).reward.canBeApplied,
    icon: ec => {
      const base = MultiplierTabIcons.CHALLENGE("eternity");
      return {
        color: base.color,
        symbol: `${base.symbol}${ec}`,
      };
    },
  },
  cursedRow: {
    name: (row, dim) => { 
      const name = "Cursed Row ".concat(row);
      return dim?.length === 2
        ? name.concat(" (", dim, ")")
        : name
    },
    multValue: (row, dim) => {
      // Cursed row 3 is a Tickspeed divisor.
      if (row === 3) return CursedRow(row).canBeApplied ? 
          DC.D1.divide(CursedRow(row).effectOrDefault(1)) : 1

      if (!dim) return CursedRow(row).canBeApplied ? CursedRow(row).effectOrDefault(1) : 1;

      if (dim?.length === 2) {
        let totalEffect = DC.D1;
        for (let tier = 1; tier <= MultiplierTabHelper.activeDimCount(dim); tier++) {
          let singleEffect;
          singleEffect = (MultiplierTabHelper.cursedRowDimCheck(row, `${dim}${tier}`) &&
              CursedRow(row).canBeApplied) ? CursedRow(row).effectOrDefault(1) : 1;
          totalEffect = totalEffect.times(singleEffect);
        }
        return totalEffect;
      }
    },
    isActive: row => CursedRow(row).canBeApplied,
    icon: row => {
      const base = MultiplierTabIcons.CURSED_ROW;
      return {
        color: base.color,
        symbol: `${base.symbol}${row}`,
      };
    },
  },
};
