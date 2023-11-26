import { DC } from "../../constants";
import { PlayerProgress } from "../../player-progress";

/*
TODO:
-Add curses for Achievement rows <DONE FOR NOW>
  |>Multiplier tab functionality <DONE>
  |>Add visuals to indicate when a row is about to be cursed, and when it's cursed <DONE>
  |>Make it disable Achievements <DONE>
  |>Allow to curse rows in-game <DONE>
  |>Allow to remove cursed rows upon Reality <DONE>
  |>Improve visuals <DONE FOR NOW>
  |>Implement 13 curses <DONE>
-Allow individual Enhancements to be respec <DONE>
-Add Enhancements for rows 10-13 <DONE>
-Add Rewards for row 17 <DONE>
  |>Make player.records.bestGalaxies for Achievement Effects (to secretly improve performance) <DONE>
  |>Undo player.records.bestGalaxies as I've found a better solution <DONE>
-Balance existing rewards <IN PROGRESS>
-Balance Hard V <DONE FOR NOW>
-Balance Imaginary upgrades' unlocks <IN PROGRESS>
-Balance Lai'tela
-Update h2p entries
-Changelog
*/

export const normalAchievements = [
  {
    // Row 1 rewards implemented & enhanced!
    id: 11,
    name: "You gotta start somewhere",
    description: "Buy a 1st Antimatter Dimension.",
    checkEvent: GAME_EVENT.ACHIEVEMENT_EVENT_OTHER,
    get reward() { return `1st Antimatter Dimensions are ${formatInt(10)} times cheaper.`; },
    enhanced: {
      get reward() { return `1st Antimatter Dimensions' starting cost is ${formatInt(1)} AM, and
        their initial cost scaling is ${formatX(2)}. If this row is fully Enhanced, decrease
        post-infinity cost scaling for Antimatter Dimensions by -${format(0.01, 2, 2)}.`},
      effect: () => {
        for (let i = 1; i <= 8; i++) {
          if (!Achievement(10 + i).isEnhanced) return 0;
        }
        return 0.01;
      }
    }
  },
  {
    id: 12,
    name: "100 antimatter is a lot",
    description: "Buy a 2nd Antimatter Dimension.",
    checkEvent: GAME_EVENT.ACHIEVEMENT_EVENT_OTHER,
    get reward() { return `2nd Antimatter Dimensions are ${formatInt(10)} times cheaper.`; },
    enhanced: {
      get reward() { return `2nd Antimatter Dimensions' starting cost is ${formatInt(1)} AM, and
        their initial cost scaling is ${formatX(2)}.`}
    }
  },
  {
    id: 13,
    name: "Half life 3 CONFIRMED",
    description: "Buy a 3rd Antimatter Dimension.",
    checkEvent: GAME_EVENT.ACHIEVEMENT_EVENT_OTHER,
    get reward() { return `3rd Antimatter Dimensions are ${formatInt(10)} times cheaper.`; },
    enhanced: {
      get reward() { return `3rd Antimatter Dimensions' starting cost is ${formatInt(1)} AM, and
        their initial cost scaling is ${formatX(2)}.`}
    }
  },
  {
    id: 14,
    name: "L4D: Left 4 Dimensions",
    description: "Buy a 4th Antimatter Dimension.",
    checkEvent: GAME_EVENT.ACHIEVEMENT_EVENT_OTHER,
    get reward() { return `4th Antimatter Dimensions are ${formatInt(100)} times cheaper.`; },
    enhanced: {
      get reward() { return `4th Antimatter Dimensions' starting cost is ${formatInt(1)} AM, and
        their initial cost scaling is ${formatX(2)}.`}
    }
  },
  {
    id: 15,
    name: "5 Dimension Antimatter Punch",
    description: "Buy a 5th Antimatter Dimension.",
    checkEvent: GAME_EVENT.ACHIEVEMENT_EVENT_OTHER,
    get reward() { return `5th Antimatter Dimensions are ${formatInt(100)} times cheaper.`; },
    enhanced: {
      get reward() { return `5th Antimatter Dimensions' starting cost is ${formatInt(1)} AM, and
        their initial cost scaling is ${formatX(2, 1, 1)}.`}
    }
  },
  {
    id: 16,
    name: "We couldn't afford 9",
    get description() {
      return Enslaved.isRunning
        ? "Buy a 6th Antimatter Dimension (they never amount to anything)"
        : "Buy a 6th Antimatter Dimension.";
    },
    checkEvent: GAME_EVENT.ACHIEVEMENT_EVENT_OTHER,
    get reward() { return `6th Antimatter Dimensions are ${formatInt(1000)} times cheaper.`; },
    enhanced: {
      get reward() { return `6th Antimatter Dimensions' starting cost is ${formatInt(1)} AM, and
        their initial cost scaling is ${formatX(2)}.`}
    }
  },
  {
    id: 17,
    name: "Not a luck related achievement",
    description: "Buy a 7th Antimatter Dimension.",
    checkEvent: GAME_EVENT.ACHIEVEMENT_EVENT_OTHER,
    get reward() { return `7th Antimatter Dimensions are ${formatInt(1000)} times cheaper.`; },
    enhanced: {
      get reward() { return `7th Antimatter Dimensions' starting cost is ${formatInt(1)} AM, and
        their initial cost scaling is ${formatX(2)}.`}
    }
  },
  {
    id: 18,
    name: "90 degrees to infinity",
    get description() {
      return Enslaved.isRunning
        ? "Buy an 8th Antimatter Dimension (don't get used to it)"
        : "Buy an 8th Antimatter Dimension.";
    },
    checkEvent: GAME_EVENT.ACHIEVEMENT_EVENT_OTHER,
    get reward() { return `8th Antimatter Dimensions are ${formatInt(1000)} times cheaper.`; },
    enhanced: {
      get reward() { return `8th Antimatter Dimensions' starting cost is ${formatInt(1)} AM, and
        their initial cost scaling is ${formatX(32)}.`}
    }
  },
  {
    // Buffed & Enhanced!
    id: 21,
    name: "To infinity!",
    description: "Go Infinite.",
    checkRequirement: () => true,
    checkEvent: GAME_EVENT.BIG_CRUNCH_BEFORE,
    get reward() { return `Start with ${formatInt(200)} antimatter.`; },
    effect: 200,
    enhanced: {
      get reward() { return `Multiply starting Antimatter by your Infinity amount.`},
      effect: () => Currency.infinitiesTotal.value.clampMin(1).powEffectsOf(Achievement(55).enhancedEffect, TimeStudy(31)),
      formatEffect: value => {
        // Since TS31 is already accounted for in the effect prop, we need to "undo" it to display the base value here
        const mult = formatX(value, 2, 2);
        return TimeStudy(31).canBeApplied
          ? `${formatX(value.pow(1 / TimeStudy(31).effectValue), 2, 1)} (After TS31: ${mult})`
          : mult;
      }
    }
  },
  {
    // Implemented & Enhanced! Biggest challenge so far, and I'm very happy with it!
    id: 22,
    name: "FAKE NEWS!",
    get description() { return `Encounter ${formatInt(50)} different news messages.`; },
    checkRequirement: () => NewsHandler.uniqueTickersSeen >= 50,
    checkEvent: GAME_EVENT.REALITY_RESET_AFTER,
    reward: "Add a fast-forward button to the news ticker.",
    enhanced: {
      reward: "Add a fast-forward button and a skip button to the news ticker. " +
        "This Achievement can be Enhanced for free.",
    }
  },
  {
    // Modified & Enhanced!
    id: 23,
    name: "The 9th Dimension is a lie",
    get description() { return `Have exactly ${formatInt(99)} 8th Antimatter Dimensions.`; },
    checkRequirement: () => AntimatterDimension(8).amount.eq(99),
    get reward () { return Achievement(145).canBeApplied ? 
      "8th Antimatter Dimensions are stronger if you have a sacrifice (improved by Achievement 145)." : 
      "8th Antimatter Dimensions are stronger the first 15 seconds after a Dimensional Sacrifice."},
    effect: () => Sacrifice.totalBoost.lte(1) ? 1 : 
    Achievement(145).canBeApplied ? 6 : Math.clamp(Time.timeSinceLastSacrifice.totalSeconds - 3, 0, 12) * -5 / 12 + 6,
    formatEffect: value => `${formatX(value, 2, 2)}`,
    enhanced: {
      get reward() { return Achievement(145).canBeApplied ? 
        "8th Antimatter Dimensions are way stronger if you have a sacrifice (improved by Achievement 145)." :
        "8th Antimatter Dimensions are way stronger the first million years after a Dimensional Sacrifice."},
      effect: () => Sacrifice.totalBoost.lte(1) ? DC.D1 : 
        Achievement(145).canBeApplied ? DC.E11111 : 
        DC.E11111.pow(1 - Math.clampMax(Time.timeSinceLastSacrifice.totalYears / 1e6, 1)),
      formatEffect: value => `${formatX(value, 1, 1)}`,
    }
  },
  {
    // Implemented & Enhanced!
    id: 24,
    name: "Antimatter Apocalypse",
    get description() { return `Get over ${format(DC.E80)} antimatter.`; },
    checkRequirement: () => Currency.antimatter.exponent >= 80,
    checkEvent: GAME_EVENT.GAME_TICK_AFTER,
    get reward() { return `2nd Antimatter Dimensions are slightly stronger based on current Antimatter.`; },
    effect: () => Math.max(1, Math.pow(1.1, Math.pow(Currency.antimatter.exponent, 0.25) - 1.25)),
    formatEffect: value => `${formatX(value, 2, 2)}`,
    enhanced: {
      reward: "2nd Antimatter Dimensions are mildly stronger based on current Antimatter.",
      effect: () => DC.D1_3.pow(Math.pow(Currency.antimatter.exponent, 0.56)),
      formatEffect: value => `${formatX(value, 2, 2)}`,
    }
  },
  {
    // Implemented & Enhanced!
    id: 25,
    name: "Boosting to the max",
    get description() { return `Buy ${formatInt(10)} Dimension Boosts.`; },
    checkRequirement: () => DimBoost.purchasedBoosts >= 10,
    checkEvent: GAME_EVENT.DIMBOOST_AFTER,
    get reward() { return `Dimension Boosts require ${formatInt(5)} fewer Dimensions.`; },
    effect: 5,
    enhanced: {
      get reward() { return `Gain ${formatInt(100)} free Dimension Boosts, +${formatInt(1)} for 
        every ${formatInt(1000)} purchased Dimension Boosts.`; },
      effect: () => 100 + Math.floor(DimBoost.realBoosts / 1000),
      formatEffect: value => `+${formatInt(value)}`
    }
  },
  {
    // Implemented & Enhanced! Surprisingly difficult.
    id: 26,
    name: "You got past The Big Wall",
    description: "Buy an Antimatter Galaxy.",
    checkRequirement: () => true,
    checkEvent: GAME_EVENT.GALAXY_RESET_BEFORE,
    reward: "Start with a free Tickspeed Upgrade.",
    effect: 1,
    enhanced: {
      get reward() { return `Gain ${formatInt(100)} free Tickspeed Upgrades, +${formatInt(1)} for 
        every ${formatInt(1000)} purchased Tickspeed Upgrades.`},
      effect: () => 100 + Math.floor(Tickspeed.totalUpgrades / 1000),
      formatEffect: value => `+${formatInt(value)}`
    }
  },
  {
    // Implemented & Enhanced!
    id: 27,
    name: "Double Galaxy",
    get description() { return `Buy ${formatInt(2)} Antimatter Galaxies.`; },
    checkRequirement: () => player.galaxies >= 2,
    checkEvent: GAME_EVENT.GALAXY_RESET_AFTER,
    get reward() { return `Antimatter Galaxies require ${formatInt(10)} fewer Dimensions.`; },
    effect: 10,
    enhanced: {
      get reward() { return `Antimatter Galaxies require ${formatInt(60)} fewer Dimensions, and 
        their requirement increase by ${formatInt(2)} fewer Dimensions.`; },
      effects: {
        initialReduction: 60,
        perGalaxyReduction: 2
      }
    }
  },
  {
    // Modified & Enhanced!
    id: 28,
    name: "There's no point in doing that...",
    get description() {
      return `Buy a single 1st Antimatter Dimension when you have over ${format(DC.E150)} of them.`;
    },
    checkRequirement: () => AntimatterDimension(1).amount.exponent >= 150,
    checkEvent: GAME_EVENT.ACHIEVEMENT_EVENT_OTHER,
    reward: "1st Antimatter Dimensions are slightly stronger based on their amount.",
    effect: () => 1 + AntimatterDimension(1).amount.exponent / 750,
    formatEffect: value => `${formatX(value, 2, 2)}`,
    enhanced: {
      reward: "1st Antimatter Dimensions are significantly stronger based on their amount.",
      effect: () => Decimal.pow(AntimatterDimension(1).amount.exponent, 1250).clampMin(1),
      formatEffect: value => `${formatX(value, 2, 2)}`,
    }
  },
  {
    // Modified & Enhanced!
    id: 31,
    name: "I forgot to nerf that",
    get description() { return `Get any Antimatter Dimension multiplier over ${formatX(DC.E31)}.`; },
    checkRequirement: () => AntimatterDimensions.all.some(x => x.multiplier.exponent >= 31),
    checkEvent: GAME_EVENT.GAME_TICK_AFTER,
    reward: "1st Antimatter Dimensions are stronger based on achievement rows completed.",
    effect: () => Math.pow(1 + Achievements.allRows.countWhere(row => row.every(ach => ach.isUnlocked)) * 0.2,
    Achievements.allRows.countWhere(row => row.every(ach => ach.isUnlocked))),
    formatEffect: value => `${formatX(value, 2, 2)}`,
    enhanced: {
      reward: "1st Antimatter Dimensions are way stronger based on achievements completed.",
      effect: () => Decimal.pow(Achievements.effectiveCount, 
        Decimal.pow(Achievements.effectiveCount, Achievements.effectiveCount / 14.9 - 5.65)),
      formatEffect: value => `${formatX(value, 2, 2)}`
    }
  },
  {
    // Enhanced!
    id: 32,
    name: "The Gods are pleased",
    get description() { return `Get over ${formatX(600)} from Dimensional Sacrifice outside of Challenge 8.`; },
    checkRequirement: () => !NormalChallenge(8).isOnlyActiveChallenge && Sacrifice.totalBoost.gte(600),
    checkEvent: GAME_EVENT.SACRIFICE_RESET_AFTER,
    get reward() {
      return `Dimensional Sacrifice is stronger.
      ${Sacrifice.getSacrificeDescription({ "Achievement32": false, "Enhancement32": false, 
        "Achievement57": false, "Enhancement57": false, "Achievement88": false, "Enhancement88": false })} ➜
      ${Sacrifice.getSacrificeDescription({ "Achievement32": true, "Enhancement32": false, 
        "Achievement57": false, "Enhancement57": false, "Achievement88": false, "Enhancement88": false })}`;
    },
    effect: 0.1,
    enhanced: {
      get reward() { return  `Dimensional Sacrifice is mildly stronger.
      ${Sacrifice.getSacrificeDescription({ "Achievement32": true, "Enhancement32": false, 
        "Achievement57": true, "Enhancement57": false, "Achievement88": true, "Enhancement88": false})} ➜
      ${Sacrifice.getSacrificeDescription({ "Achievement32": false ,"Enhancement32": true,
        "Achievement57": true, "Enhancement57": false, "Achievement88": true, "Enhancement88": false})}`;
      },
      effect: 0.16
    }
  },
  {
    // Implemented & Enhanced!
    id: 33,
    name: "That's a lot of infinites",
    get description() { return `Reach Infinity ${formatInt(10)} times.`; },
    checkRequirement: () => Currency.infinities.gte(10),
    checkEvent: GAME_EVENT.BIG_CRUNCH_AFTER,
    get reward() {
      return `Infinities more than ${formatInt(60)} seconds long
      give ${formatX(2)} more Infinities.`;
    },
    effect: 2,
    effectCondition: () => Time.thisInfinity.totalSeconds > 60,
    enhanced: {
      reward: "Gain more Infinities based on the length of your current Infinity.",
      effect: () => Math.clampMin(Math.pow(Math.log(Time.thisInfinity.totalSeconds + 1), 2), 1),
      formatEffect: value => `${formatX(value, 2, 2)}`
    }
  },
  {
    // Modified & Enhanced!
    id: 34,
    name: "You didn't need it anyway",
    description: "Infinity without having any 8th Antimatter Dimensions.",
    checkRequirement: () => AntimatterDimension(8).totalAmount.eq(0),
    checkEvent: GAME_EVENT.BIG_CRUNCH_BEFORE,
    reward: "Antimatter Dimensions 1-7 are stronger the less Antimatter Dimensions you are using.",
    effect() {
      for (let i = 8; i > 0; i--) {
        if (AntimatterDimension(i).isProducing) {return 1.8 - i * 0.09;}
      }
      return 1.8;
    },
    formatEffect: value => `${formatX(value, 2, 2)}`,
    enhanced: {
      reward: "Antimatter Dimensions 1-7 are way stronger the less Dimensions you are using. " +
        "This takes into account ALL Dimensions.",
      effect() {
        let dimensionPower = 0;
        for (let i = 8; i > 0; i--) {
          if (AntimatterDimension(i).isProducing) dimensionPower += 4;
          if (InfinityDimension(i).isProducing) dimensionPower += 3;
          if (TimeDimension(i).isProducing) dimensionPower += 2;
        }
        for (let i = 4; i > 0; i--) {
          if (DarkMatterDimension(i).isUnlocked) dimensionPower += 1;
        }
        return DC.E150.pow(76 - dimensionPower).clampMin(10);
      },
      formatEffect: value => `${formatX(value, 2, 2)}`,
    }
  },
  {
    // Implemented & Enhanced!
    id: 35,
    name: "Don't you dare sleep",
    get description() {
      return PlayerProgress.realityUnlocked()
        ? `Be offline for a period of over ${formatInt(6)} hours (real time).`
        : `Be offline for a period of over ${formatInt(6)} hours.`;
    },
    checkRequirement: () => Date.now() - player.lastUpdate >= 21600000,
    checkEvent: GAME_EVENT.GAME_TICK_BEFORE,
    get reward() { 
      return PlayerProgress.realityUnlocked()
        ? `Extremely small multiplier to Antimatter Dimensions based on time played (real time).`
        : `Extremely small multiplier to Antimatter Dimensions based on time played.`;
    },
    effect: () => Math.max(Math.pow(Time.realTimePlayed.totalHours / 6, 0.04), 1),
    formatEffect: value => `${formatX(value, 2, 2)}`,
    enhanced: {
      get reward() { return Laitela.isUnlocked ? "Small multiplier to all Dimensions, excluding Dark Matter Dimensions, "
      + "based on time played (real time).": "Small multiplier to all Dimensions "
      + "based on time played (real time).";
      },
      effect: () => Math.pow(Time.realTimePlayed.totalMilliseconds, 10),
      formatEffect: value => `${formatX(value, 2, 2)}`,
    }
  },
  {
    // Buffed & Enhanced!
    id: 36,
    name: "Claustrophobic",
    get description() {
      return `Infinity with just ${formatInt(1)} Antimatter Galaxy. (Your Antimatter Galaxies are reset on Infinity.)`;
    },
    checkRequirement: () => player.galaxies === 1,
    checkEvent: GAME_EVENT.BIG_CRUNCH_BEFORE,
    get reward() { return `Multiply starting tick speed by ${format(1.05, 2, 2)}.`; },
    effect: 1 / 1.05,
    enhanced: {
      get reward() { return `Multiply starting tick speed by ${formatPostBreak(DC.E1000)}.`; },
      effect: DC.D1.divide(DC.E1000),
    }
  },
  {
    // Buffed & Enhanced!
    id: 37,
    name: "That's FAST!",
    get description() { return `Infinity in under ${formatInt(2)} hours.`; },
    checkRequirement: () => Time.thisInfinityRealTime.totalHours <= 2,
    checkEvent: GAME_EVENT.BIG_CRUNCH_BEFORE,
    get reward() { return `Start with ${formatInt(50000)} antimatter.`; },
    effect: 50000,
    enhanced: {
      get reward() { return `Multiply starting Antimatter and Infinity Points by your Eternity amount,
        and gain ${formatX(5)} more Eternities.`;},
      effect: () => Decimal.clampMin(player.eternities, 1).powEffectOf(Achievement(55).enhancedEffect),
      formatEffect: value => `${formatX(value, 2, 2)}`
    }
  },
  {
    // Implemented & Enhanced!
    id: 38,
    name: "I don't believe in Gods",
    get description() {
      return `Buy an Antimatter Galaxy without Dimensional Sacrificing.
        (Your Antimatter Galaxies are reset on Infinity.)`;
    },
    checkRequirement: () => player.requirementChecks.infinity.noSacrifice,
    checkEvent: GAME_EVENT.GALAXY_RESET_BEFORE,
    reward: "8th Antimatter Dimensions are stronger the less sacrifices you have.",
    effect: () => DC.E1.divide(Sacrifice.totalBoost.pow(0.2)).clampMin(1),
    formatEffect: value => `${formatX(value, 2, 2)}`,
    enhanced: {
      reward: "8th Antimatter Dimensions are way stronger the less sacrifices you have.",
      effect: () => DC.E22500.divide(Sacrifice.totalBoost.pow(0.001)).clampMin(10),
      formatEffect: value => `${formatX(value, 2, 2)}`
    }
  },
  {
    // Enhanced!
    id: 41,
    name: "No DLC required",
    get description() { return `Buy ${formatInt(16)} Infinity Upgrades.`; },
    checkRequirement: () => player.infinityUpgrades.size >= 16,
    checkEvent: [
      GAME_EVENT.INFINITY_UPGRADE_BOUGHT,
      GAME_EVENT.REALITY_RESET_AFTER,
      GAME_EVENT.REALITY_UPGRADE_TEN_BOUGHT
    ],
    get reward() {
      return `Unlock two new Infinity Upgrades- ${formatX(2)} IP multiplier and offline IP generation.`;
    },
    enhanced: {
      get reward() {
        return `Unlock three new Infinity Upgrades- ${formatX(2)} IP multiplier, offline IP generation, and 
        IP multipler uncap.`;
      },
    }
  },
  {
    // Implemented & Enhanced! This one has been a nightmare
    // Lesson: Don't use production per second in rewards, causes recursion.
    id: 42,
    name: "Super Sanic",
    get description() {
      return `Have antimatter per second exceed your current antimatter above ${format(DC.E63)}.`;
    },
    checkRequirement: () =>
      Currency.antimatter.exponent >= 63 &&
      Currency.antimatter.productionPerSecond.gt(Currency.antimatter.value),
    checkEvent: GAME_EVENT.GAME_TICK_AFTER,
    get reward() { return `1st Antimatter Dimensions are stronger based on your current
    Antimatter amount, but only if your production is larger.`},
    effect: () => Decimal.max(1, Decimal.pow(DC.D1_2, Math.pow(Math.log10(Currency.antimatter.exponent) - 1, 2))),
    effectCondition: () => Time.timeWithExcessAMProd.totalMilliseconds >= 200,
    formatEffect: value => Time.timeWithExcessAMProd.totalMilliseconds >= 200 ? `${formatX(value, 2, 2)}` :
    `Inactive (would be ${formatX(value, 2, 2)})`,
    enhanced: {
      get reward() { return `1st Antimatter Dimensions are way stronger based on your current
        Antimatter amount, but only if your production is larger.`},
      effect: () => Decimal.pow(DC.D1_0000109, Math.pow(Currency.antimatter.exponent, 1.027)).clampMin(1).times(1000),
      effectCondition: () => Time.timeWithExcessAMProd.totalMilliseconds >= 200,
      formatEffect: value => Time.timeWithExcessAMProd.totalMilliseconds >= 200 ? `${formatX(value, 2, 2)}` :
      `Inactive (would be ${formatX(value, 2, 2)})`,
    }
  },
  {
    // Enhanced!
    id: 43,
    name: "How the antitables have turned..",
    description:
      "Get the 8th Antimatter Dimension multiplier to be highest, 7th Antimatter Dimension multiplier " +
      " second highest, etc.",
    checkRequirement: () => {
      const multipliers = Array.range(1, 8).map(tier => AntimatterDimension(tier).multiplier);
      for (let i = 0; i < multipliers.length - 1; i++) {
        if (multipliers[i].gte(multipliers[i + 1])) return false;
      }
      return true;
    },
    checkEvent: GAME_EVENT.GAME_TICK_AFTER,
    get reward() {
      return `Each Antimatter Dimension gains a boost proportional to tier
      (8th gets ${formatPercents(0.08)}, 7th gets ${formatPercents(0.07)}, etc.)`;
    },
    enhanced: {
      get reward() {
        return `Each Antimatter Dimension gains a massive boost proportional to tier
        (8th gets ${formatX(DC.E2000)}, 7th gets ${formatX(DC.E1750)}, etc.)`;
      },
    }
  },
  {
    // Implemented & Enhanced!
    id: 44,
    name: "Over in 30 Seconds",
    get description() {
      return `Have antimatter per second exceed your current antimatter
      for ${formatInt(30)} consecutive seconds.`;
    },
    checkRequirement: () => Time.timeWithExcessAMProd.totalSeconds >= 30,
    checkEvent: GAME_EVENT.GAME_TICK_AFTER,
    reward: "1st Antimatter Dimensions are stronger the longer your antimatter per second " +
      "exceeds your current antimatter.",
    effect() {
      const excessTimeProduction = Time.timeWithExcessAMProd.totalSeconds;
      return excessTimeProduction >= 30 ?
      Math.pow(excessTimeProduction - 30, 0.6) / 100 + 1.3 : 
      1 + excessTimeProduction / 100;
    },
    formatEffect: value => `${formatX(value, 2, 2)}`,
    enhanced: {
      reward: "1st Antimatter Dimensions are significantly stronger the longer your antimatter per second " +
      "exceeds your current antimatter.",
      effect() {
        const excessTimeProduction = Time.timeWithExcessAMProd.totalMilliseconds;
        return Decimal.pow(excessTimeProduction, 1000).clampMin(1);
      },
      formatEffect: value => `${formatX(value, 2, 2)}`,
    }
  },
  {
    // Modified & Enhanced!
    id: 45,
    name: "Faster than a potato",
    get description() { return `Get more than ${format(DC.E29)} ticks per second.`; },
    checkRequirement: () => Tickspeed.current.exponent <= -26,
    checkEvent: GAME_EVENT.GAME_TICK_AFTER,
    get reward() { return `Tickspeed is just below ${formatPercents(0.01)} faster per Dimension Boost.`; },
    effect: () => DC.D1_007.pow(DimBoost.totalBoosts).recip(),
    formatEffect: value => `${formatX(value.recip(), 2, 2)}`,
    enhanced: {
      get reward() { return `Tickspeed is exactly ${formatPercents(0.08)} faster per Dimension Boost.`; },
      effect: () => DC.D1_08.pow(DimBoost.totalBoosts).recip(),
      formatEffect: value => `${formatX(value.recip(), 2, 2)}`,
    }
  },
  {
    // Implemented & Enhanced! Very happy about this one, the code might be better
    id: 46,
    name: "Multidimensional",
    get description() { return `Reach ${format(DC.E12)} of all Antimatter Dimensions except the 8th.`; },
    checkRequirement: () => AntimatterDimension(7).amount.exponent >= 12,
    checkEvent: GAME_EVENT.GAME_TICK_AFTER,
    reward: "8th Antimatter Dimensions are slightly stronger based on the product of all your AD amounts.",
    effect: () => Decimal.max(AntimatterDimension(1).amount.times(AntimatterDimension(2).amount.times(AntimatterDimension(3).
    amount.times(AntimatterDimension(4).amount.times(AntimatterDimension(5).amount.times(AntimatterDimension(6).amount.times(
    AntimatterDimension(7).amount)))))).pow(0.00002).plus(0.05), 1),
    formatEffect: value => `${formatX(value, 2, 2)}`,
    enhanced: {
      reward: "8th Antimatter Dimensions are significantly stronger based on the product of your Antimatter and " + 
        "all AD amounts.",
        effect: () => Currency.antimatter.value.times(AntimatterDimension(1).amount.times(AntimatterDimension(2).amount.times(
          AntimatterDimension(3).amount.times(AntimatterDimension(4).amount.times(AntimatterDimension(5).amount.times(
            AntimatterDimension(6).amount.times(AntimatterDimension(7).amount))))))).pow(0.00003).plus(1),
          formatEffect: value => `${formatX(value, 2, 2)}`,
    }
  },
  {
    // Implemented & Enhanced! :)
    id: 47,
    name: "Daredevil",
    get description() { return `Complete ${formatInt(3)} Normal Challenges.`; },
    checkRequirement: () => NormalChallenges.all.countWhere(c => c.isCompleted) >= 3,
    checkEvent: [GAME_EVENT.BIG_CRUNCH_AFTER, GAME_EVENT.REALITY_RESET_AFTER, GAME_EVENT.REALITY_UPGRADE_TEN_BOUGHT],
    get reward () { 
      return `For every Normal Challenge completed, all Antimatter Dimensions are ${formatPercents(0.02)} stronger.`;
    },
    effect: () => Math.pow(1.02, NormalChallenges.all.countWhere(c => c.isCompleted)),
    formatEffect: value => `${formatX(value, 2, 2)}`,
    enhanced: {
      get reward () {
        if (Teresa.isUnlocked) return `For every Celestial Reality beaten, 
          raise all Antimatter Dimensions by +${format(0.001, 3, 3)} power.`;
        else return "Unlock Teresa to unlock this reward.";
      },
      effect: () => 1 + 
        (Teresa.runCompleted ? 0.001 : 0) +
        (Effarig.currentStage == EFFARIG_STAGES.COMPLETED ? 0.001 : 0) + 
        (Enslaved.isCompleted ? 0.001 : 0) +
        (V.spaceTheorems >= 1 ? 0.001 : 0) +
        (player.celestials.ra.pets.teresa.memories > 1 ? 0.001 : 0) +
        (Laitela.difficultyTier >= 1 ? 0.001 : 0),
        formatEffect: value => Teresa.isUnlocked ? `${formatPow(value, 3, 3)}` : "Locked.",
    }
  },
  {
    // Modified & Enhanced!
    id: 48,
    name: "Antichallenged",
    get description() { return `Complete all ${formatInt(12)} Normal Challenges.`; },
    checkRequirement: () => NormalChallenges.all.countWhere(c => !c.isCompleted) === 0,
    checkEvent: [GAME_EVENT.BIG_CRUNCH_AFTER, GAME_EVENT.REALITY_RESET_AFTER, GAME_EVENT.REALITY_UPGRADE_TEN_BOUGHT],
    get reward() { 
      if (Laitela.isUnlocked) {
        return `ALL Dimensions, including IDs, TDs, and DMDs, are ${formatPercents(0.12)} stronger.`;
      }
      else if (PlayerProgress.eternityUnlocked()) {
        return `ALL Dimensions, including IDs and TDs, are ${formatPercents(0.12)} stronger.`;
      }
      else if (InfinityDimension(1).isUnlocked) {
        return `ALL Dimensions, including Infinity Dimensions, are ${formatPercents(0.12)} stronger.`; 
      };
      return `ALL Dimensions are ${formatPercents(0.12)} stronger.`
    },
    effect: 1.12,
    enhanced: {
      get reward() { 
        if (Laitela.isUnlocked) {
          return `ALL Dimensions, including IDs, TDs, and DMDs, are ${formatPercents(0.50)} stronger.`;
        }
        else { return `ALL Dimensions, including IDs and TDs, are ${formatPercents(0.50)} stronger.`};
      },
      effect: 1.5,
    }
  },

  {
    // Implemented & Enhanced!
    id: 51,
    name: "Limit Break",
    description: "Break Infinity.",
    checkRequirement: () => player.break,
    checkEvent: [GAME_EVENT.BREAK_INFINITY, GAME_EVENT.REALITY_RESET_AFTER, GAME_EVENT.REALITY_UPGRADE_TEN_BOUGHT],
    reward: "All Dimension Boosts affect all Antimatter Dimensions.",
    enhanced: {
      reward: "All Dimension boosts affect all Antimatter Dimensions, and all Time Dimensions" + 
        " at a greatly reduced rate.",
      effect: () => DimBoost.multiplierToNDTier(1).pow(0.000015),
      formatEffect: value => `${formatX(value, 2, 2)}`
    }
  },
  {
    // Implemented & Enhanced!
    id: 52,
    name: "Age of Automation",
    description: "Max the interval for Antimatter Dimension and Tickspeed upgrade autobuyers.",
    checkRequirement: () => Autobuyer.antimatterDimension.zeroIndexed.concat(Autobuyer.tickspeed)
      .every(a => a.isUnlocked && a.hasMaxedInterval),
    checkEvent: [GAME_EVENT.REALITY_RESET_AFTER, GAME_EVENT.REALITY_UPGRADE_TEN_BOUGHT],
    reward: "Antimatter Dimensions and Tickspeed Upgrades no longer spend Antimatter.",
    enhanced: {
      get reward() { return `Antimatter Dimensions and Tickspeed Upgrades give their Antimatter cost 
        when purchased, multiplied by the common Buy 10 factor 
        (${formatX(AntimatterDimensions.buyTenMultiplier, 2, 2)}), instead of spending them.` }
    }
  },
  {
    // Implemented & Enhanced!
    id: 53,
    name: "Definitely not worth it",
    description: "Max the intervals for all normal autobuyers.",
    // The upgradeable autobuyers are dimensions, tickspeed, dimension boost,
    // galaxy, and big crunch (the ones you get from normal challenges).
    // We don't count autobuyers which can be upgraded via e.g. perks as upgradeable.
    checkRequirement: () => Autobuyers.upgradeable
      .every(a => a.isUnlocked && a.hasMaxedInterval),
    checkEvent: [GAME_EVENT.REALITY_RESET_AFTER, GAME_EVENT.REALITY_UPGRADE_TEN_BOUGHT],
    reward: "Start with an 8th AD, if possible. Disabled if the 8th AD autobuyer is also disabled.",
    effect: 1,

    effectCondition: () => Autobuyer.antimatterDimension(8).isActive && player.auto.autobuyersOn &&
      player.auto.antimatterDims.isActive,
    enhanced: {
      get reward() {
        return `Gain free 8th ADs, that don't affect costs, equal to your best Galaxy total this Reality.`;
      },
      effect: () => player.records.thisReality.bestTotalGalaxies,
      formatEffect: value => Enslaved.isRunning ? `Shattered by Nameless` : `+${formatInt(value)}`
    }
  },
  {
    // Buffed & Enhanced!
    id: 54,
    name: "That's FASTER!",
    get description() { return `Infinity in ${formatInt(10)} minutes or less.`; },
    checkRequirement: () => Time.thisInfinityRealTime.totalMinutes <= 10,
    checkEvent: GAME_EVENT.BIG_CRUNCH_BEFORE,
    get reward() { return `Start with ${format(5e6)} antimatter.`; },
    effect: 5e6,
    enhanced: {
      reward: "Multiply your starting AM, IP and EP amount by your Reality amount.",
      effect: () => Decimal.clampMin(player.realities, 1).powEffectOf(Achievement(55).enhancedEffect),
      formatEffect: value => `${formatX(value, 2, 2)}`
    }
  },
  {
    // Buffed & Enhanced!
    id: 55,
    name: "Forever isn't that long",
    get description() { return `Infinity in ${formatInt(1)} minute or less.`; },
    checkRequirement: () => Time.thisInfinityRealTime.totalMinutes <= 1,
    checkEvent: GAME_EVENT.BIG_CRUNCH_BEFORE,
    get reward() { return `Start with ${format(5e12)} antimatter.`; },
    effect: 5e12,
    enhanced: {
      get reward() {
        return `Raise the Enhanced effects affecting starting resources by ${formatPow(50)}.`;
      },
      effect: 50
    }
  },
  {
    // Enhanced! But kinda lame
    id: 56,
    name: "Many Deaths",
    get description() {
      return `Complete the 2nd Antimatter Dimension Autobuyer Challenge in ${formatInt(3)} minutes or less.`;
    },
    checkRequirement: () => NormalChallenge(2).isOnlyActiveChallenge && Time.thisInfinityRealTime.totalMinutes <= 3,
    checkEvent: GAME_EVENT.BIG_CRUNCH_BEFORE,
    get reward() {
      return Achievement(145).canBeApplied ? `All Antimatter Dimensions are stronger (improved by Achievement 145).` : 
        `All Antimatter Dimensions are stronger in the first ${formatInt(3)} minutes of Infinities.`;
    },
    effect: () => Achievement(145).canBeApplied ? 2 : Math.max(6 / (Time.thisInfinity.totalMinutes + 3), 1),
    effectCondition: () => Achievement(145).canBeApplied || Time.thisInfinity.totalMinutes < 3,
    formatEffect: value => `${formatX(value, 2, 2)}`,
    enhanced: {
      get reward() {
        return `All Antimatter Dimensions are ${formatX(DC.E100000)} stronger.`;
      },
      effect: DC.E100000
    }
  },
  {
    // Enhanced!
    id: 57,
    name: "Gift from the Gods",
    get description() {
      return `Complete the 8th Antimatter Dimension Autobuyer Challenge in ${formatInt(3)} minutes or less.`;
    },
    checkRequirement: () => NormalChallenge(8).isOnlyActiveChallenge && Time.thisInfinityRealTime.totalMinutes <= 3,
    checkEvent: GAME_EVENT.BIG_CRUNCH_BEFORE,
    get reward() {
      return `Dimensional Sacrifice is stronger.
        ${Sacrifice.getSacrificeDescription({ "Achievement32": true, "Enhancement32": false, 
        "Achievement57": false, "Enhancement57": false, "Achievement88": false, "Enhancement88": false })} ➜
        ${Sacrifice.getSacrificeDescription({ "Achievement32": true, "Enhancement32": false, 
        "Achievement57": true, "Enhancement57": false, "Achievement88": false, "Enhancement88": false })}`;
    },
    effect: 0.1,
    enhanced: {
      get reward() { return `Dimensional Sacrifice is mildly stronger.
        ${Sacrifice.getSacrificeDescription({ "Achievement57": true, "Enhancement57": false, 
        "Achievement88": true, "Enhancement88": false})} ➜
        ${Sacrifice.getSacrificeDescription({ "Achievement32": false, "Enhancement32": true, "Achievement57": false, 
        "Enhancement57": true, "Achievement88": true, "Enhancement88": false})}. 
        This requires Achievement 32 to be Enhanced.`;
      },
      // I don't want order to matter for Achievement Enhancement, but I want this, and Er88's effect,
      // to be applied only if r32 is enhanced. 
      // So, if r32 is not enhanced, this is a debuff.
      // The Enhancing logic prevents this from happening now.
      effect: 0.16,
      effectCondition: () => Achievement(32).isEnhanced
    }
  },
  {
    // Enhanced!
    id: 58,
    name: "This is fine.",
    get description() { return `Complete the Tickspeed Autobuyer Challenge in ${formatInt(3)} minutes or less.`; },
    checkRequirement: () => NormalChallenge(9).isOnlyActiveChallenge && Time.thisInfinityRealTime.totalMinutes <= 3,
    checkEvent: GAME_EVENT.BIG_CRUNCH_BEFORE,
    get reward() {
      return `Increase the multiplier for buying ${formatInt(10)} Antimatter Dimensions by +${formatPercents(0.01)}.`;
    },
    effect: 1.01,
    enhanced: {
      get reward() {
        return `Increase the multiplier for buying ${formatInt(10)} Antimatter Dimensions by +${formatPercents(0.60)}.`;
      },
      effect: 1.6
    }
  },
  {
    // Enhanced!
    id: 61,
    name: "Bulked Up",
    get description() {
      return `Get all of your Antimatter Dimension Autobuyer bulk amounts to
        ${formatInt(Autobuyer.antimatterDimension.bulkCap)}.`;
    },
    checkRequirement: () => Autobuyer.antimatterDimension.zeroIndexed.every(x => x.hasMaxedBulk),
    checkEvent: [GAME_EVENT.REALITY_RESET_AFTER, GAME_EVENT.REALITY_UPGRADE_TEN_BOUGHT,
      GAME_EVENT.SAVE_CONVERTED_FROM_PREVIOUS_VERSION],
    reward: "Dimension Autobuyer bulks are unlimited.",
    enhanced: {
      get reward() {
        return `Dimension Autobuyer bulks are unlimited, and the Dilation Autobuyers bulk buy 
          ${formatX(2)} as much. This can be Enhanced for free.`;
      },
      effect: 2
    }
  },
  {
    // Implemented & Enhanced!
    id: 62,
    name: "Oh, hey... You're still here?",
    get description() { return `Reach ${format(DC.E8)} Infinity Points per minute.`; },
    checkRequirement: () => Player.bestRunIPPM.exponent >= 8,
    checkEvent: GAME_EVENT.BIG_CRUNCH_AFTER,
    get reward() { return Achievement(145).canBeApplied ? 
      `A small multiplier to Infinity Points (improved by Achievement 145).` : 
      `A small multiplier to Infinity Points that fades over ${formatInt(60)}
    seconds this Infinity.`},
    effect: () => Achievement(145).canBeApplied ? 3 : 
      Math.max(1, 3 - Time.thisInfinity.totalSeconds / 30),
    effectCondition: () => Achievement(145).canBeApplied || Time.thisInfinity.totalMinutes < 1,
    formatEffect: value => `${formatX(value, 2, 2)}`,
    enhanced: {
      get reward() {
        return `A ${formatX(DC.E10500)} multiplier to Infinity Points.`;
      },
      effect: DC.E10500
    }
  },
  {
    // Implemented & Enhanced!
    id: 63,
    name: "A new beginning",
    description: "Begin generation of Infinity Power.",
    checkRequirement: () => Currency.infinityPower.gt(1),
    checkEvent: GAME_EVENT.GAME_TICK_AFTER,
    get reward() { return `Gain back those ${format(DC.E8)} IP you must have spent to get this Achievement.`},
    effect: DC.E8,
    enhanced: {
      get reward() { return `Buying Infinity Dimensions give ${formatX(8)} their Infinity Point cost to you.` }
    }
  },
  {
    // Modified & Enhanced!
    id: 64,
    name: "Zero Deaths",
    description: "Get to Infinity without Dimension Boosts or Antimatter Galaxies while in a Normal Challenge.",
    checkRequirement: () => player.galaxies === 0 && DimBoost.purchasedBoosts === 0 && NormalChallenge.isRunning,
    checkEvent: GAME_EVENT.BIG_CRUNCH_BEFORE,
    reward: "Antimatter Dimensions 1-4 are stronger the less Dimension Boosts " +
      "and Antimatter Galaxies you have bought.",
    effect: () => Math.pow(1.75 - Math.clampMax(player.galaxies, 50) / 100, 
      5 - Math.clampMax(DimBoost.realBoosts, 200) / 50),
    formatEffect: value => `${formatX(value, 2, 2)}`,
    enhanced: {
      reward: "Antimatter Dimensions 1-4 are way stronger the less Dimension Boosts " +
        "and Antimatter Galaxies you have bought.",
      effect: () => Decimal.pow(DC.E300000.pow(1 - Math.clampMax(player.galaxies, 100000) / 100000), 
        1 - DimBoost.realBoosts / 30000000).clampMin(100),
      formatEffect: value => `${formatX(value, 2, 2)}`,
    }
  },
  {
    // Enhanced!
    id: 65,
    name: "Not-so-challenging",
    get description() { return `Get the sum of all of your Normal Challenge times under ${formatInt(3)} minutes.`; },
    checkRequirement: () => Time.challengeSum.totalMinutes < 3,
    checkEvent: [GAME_EVENT.BIG_CRUNCH_AFTER, GAME_EVENT.REALITY_RESET_AFTER],
    get reward() {
      return Achievement(145).canBeApplied ? 
        `All Antimatter Dimensions are stronger, but only in Challenges (improved by Achievement 145).` :
        `All Antimatter Dimensions are stronger in the first ${formatInt(3)} minutes of Infinities,
        but only in Challenges.`;
    },
    effect: () => (Player.isInAnyChallenge ? Math.max(
      4 / (Time.thisInfinity.totalMinutes * !Achievement(145).canBeApplied + 1), 1) : 1),
    effectCondition: () => Player.isInAnyChallenge && 
      (Achievement(145).canBeApplied || Time.thisInfinity.totalMinutes < 3),

    formatEffect: value => `${formatX(value, 2, 2)}`,
    enhanced: { 
      get reward () {
        return `All Antimatter Dimensions are ${formatPostBreak(DC.E110000)} times stronger, but only 
          in Challenges${Player.isInAnyChallenge ? `` : ` (inactive)`}.`;
      },
      effect: DC.E110000,
      effectCondition: () => Player.isInAnyChallenge
    }
  },
  {
    // Modified & Enhanced!
    id: 66,
    name: "Faster than a squared potato",
    get description() { return `Get more than ${format(DC.E58)} ticks per second.`; },
    checkRequirement: () => Tickspeed.current.exponent <= -55,
    checkEvent: GAME_EVENT.GAME_TICK_AFTER,
    get reward() { return `Tickspeed is just over ${formatPercents(0.05, 2, 2)} faster per Antimatter Galaxy.`; },
    effect: () => DC.D0_95.pow(player.galaxies),
    formatEffect: value => `${formatX(value.recip(), 2, 2)}`,
    enhanced: {
      get reward() { return `Multiply Tickspeed by ${formatX(100)}, raised by your best Galaxy amount this Reality.`; },
      effect: () => DC.E2.pow(player.records.thisReality.bestTotalGalaxies).recip(),
      formatEffect: value => `${formatX(value.recip(), 2, 2)}`,
    }
  },
  {
    // Implemented & Enhanced!
    id: 67,
    name: "Infinitely Challenging",                                                                                                      
    description: "Complete an Infinity Challenge.",
    checkRequirement: () => InfinityChallenges.completed.length > 0,
    checkEvent: [GAME_EVENT.INFINITY_CHALLENGE_COMPLETED, GAME_EVENT.REALITY_RESET_AFTER],
    get reward() {return `Antimatter Dimensions are ${formatPercents(0.3)} stronger for every 
      Infinity Challenge completed.`;},
    effect: () => Math.pow(1.3, InfinityChallenges.completed.length),
    formatEffect: value => `${formatX(value, 2, 2)}`,
    enhanced: {
      get reward() {
        return `For every Celestial Reality beaten, all Dimensions${Laitela.isUnlocked ? 
        `, excluding Dark Matter Dimensions,` : ``} are ${format(DC.E250)} times stronger.`
      },
      // At this point it is assumed that, since you need 14 V-achs to enhance this, 
      // all previous Celestial Realities have been completed.
      effect: () => DC.E250.pow(4 + 
        (player.celestials.ra.pets.teresa.memories > 1) +
        (Laitela.difficultyTier >= 1),
      ),
      formatEffect: value => `${formatX(value)}`
    }
  },
  {
    // Modified & Enhanced!
    id: 68,
    name: "You did this again just for the achievement right?",
    get description() {
      return `Complete the 3rd Antimatter Dimension Autobuyer Challenge in ${formatInt(10)} seconds or less.`;
    },
    checkRequirement: () => NormalChallenge(3).isOnlyActiveChallenge && Time.thisInfinityRealTime.totalSeconds <= 10,
    checkEvent: GAME_EVENT.BIG_CRUNCH_BEFORE,
    reward: "1st Antimatter Dimensions get an exponentially increasing multiplier that " +
      "resets after Dimension Boosts, Antimatter Galaxies, and Infinities.",
    effect: () => DC.D1_00038.pow(Time.timeSinceLastReset.totalSeconds * 20).times(1.21).clampMax(DC.E15),
    formatEffect: value => `${formatX(value, 2, 2)}`,
    enhanced: {
      reward: "1st Antimatter Dimensions get an uncapped exponentially increasing multiplier that " +
        "resets after Dimension Boosts, Antimatter Galaxies, and Infinities.",
      effect() {
        const timeSinceLastReset = Time.timeSinceLastReset.totalSeconds;
        return timeSinceLastReset < 1e70 ? DC.D2.pow(Math.pow(timeSinceLastReset, 0.1)).times(Number.MAX_VALUE) :
        DC.D2.pow(1e7 * Math.pow(timeSinceLastReset / 1e70, 0.018)).times(Number.MAX_VALUE);
      },
      formatEffect: value => `${formatX(value, 2, 2)}`,
    }
  },
  {
    // Modified & Enhanced!
    id: 71,
    name: "ERROR 909: Dimension not found",
    description:
      `Get to Infinity with only a single 1st Antimatter Dimension without Dimension Boosts
      or Antimatter Galaxies, while in the 2nd Antimatter Dimension Autobuyer Challenge.`,
    checkRequirement: () =>
      NormalChallenge(2).isOnlyActiveChallenge &&
      AntimatterDimension(1).amount.eq(1) &&
      DimBoost.purchasedBoosts === 0 &&
      player.galaxies === 0,
    checkEvent: GAME_EVENT.BIG_CRUNCH_BEFORE,
    get reward() { return `1st Antimatter Dimensions are stronger the longer you don't buy an 
      Antimatter Dimension or Tickspeed upgrade. Caps at ${formatInt(3)} minutes${
        player.records.thisInfinity.time - player.records.thisInfinity.lastBuyTime >= 180000 ? 
      ` (capped).` : `.`}`; },
    effect: () => Math.clamp(player.records.thisInfinity.time - player.records.thisInfinity.lastBuyTime, 0, 180000) * 0.0001 + 2,
    formatEffect: value => `${formatX(value, 2, 2)}`,
    enhanced: {
      reward: "All Antimatter Dimensions are way stronger the longer you don't buy an " +
        "Antimatter Dimension or Tickspeed upgrade. Has no cap.",
      effect: () => Decimal.pow(Math.clampMin(player.records.thisInfinity.time - player.records.thisInfinity.lastBuyTime, 1), 2000),
      formatEffect: value => `${formatX(value, 2, 2)}`,
    }
  },
  {
    // Modified & Enhanced!
    id: 72,
    name: "Can't hold all these infinities",
    get description() {
      return `Get all Antimatter Dimension multipliers over ${formatX(Decimal.NUMBER_MAX_VALUE, 1)}.`;
    },
    checkRequirement: () => AntimatterDimensions.all.every(x => x.multiplier.gte(Decimal.NUMBER_MAX_VALUE)),
    checkEvent: GAME_EVENT.GAME_TICK_AFTER,
    get reward() { return `Raise Antimatter Dimensions such that, for every product of ${formatX(Decimal.NUMBER_MAX_VALUE, 1)},
      they are ${formatPercents(0.308, 1, 1)} stronger.`},
    effect: 1.00038044,
    enhanced: {
      get reward() { return `Raise Antimatter Dimensions such that, for every product of ${formatX(Decimal.NUMBER_MAX_VALUE, 1)},
        they are ${formatX(308)} times stronger.`},
      effect: 1.008073158
    }
  },
  {
    // Enhanced!
    id: 73,
    name: "THIS ACHIEVEMENT DOESN'T EXIST",
    get description() { return `Get ${formatPostBreak(DC.D9_9999E9999, 4)} antimatter.`; },
    checkRequirement: () => Currency.antimatter.gte(DC.D9_9999E9999),
    checkEvent: GAME_EVENT.GAME_TICK_AFTER,
    reward: "Antimatter Dimensions gain a multiplier based on current antimatter.",
    effect: () => Currency.antimatter.value.pow(0.00002).plus(1),
    formatEffect: value => `${formatX(value, 2, 2)}`,
    enhanced: {
      reward: "Antimatter Dimensions gain a bigger multiplier based on current antimatter.",
      effect: () => Currency.antimatter.value.pow(0.000029).plus(1),
      formatEffect: value => `${formatX(value, 2, 2)}`,
    }
  },
  {
    // Enhanced!
    id: 74,
    name: "Not a second lost",
    get description() { return `Get the sum of all best Normal Challenge times under ${formatInt(5)} seconds.`; },
    checkRequirement: () => Time.challengeSum.totalSeconds < 5,
    checkEvent: [GAME_EVENT.BIG_CRUNCH_AFTER, GAME_EVENT.REALITY_RESET_AFTER],
    get reward() { return `All Antimatter Dimensions are ${formatPercents(0.4)} stronger, but only in challenges.`; },
    effect: 1.4,
    effectCondition: () => Player.isInAnyChallenge,
    enhanced: {
      get reward() { return `All Dimensions${Laitela.isUnlocked ? `, excluding Dark Matter Dimensions,` : ``} 
        are ${formatX(DC.E1800)} stronger, but only in Celestial Realities.`; },
      effect: DC.E1800,
      effectCondition: () => isInCelestialReality()
    }
  },
  {
    // Enhanced!
    id: 75,
    name: "NEW DIMENSIONS???",
    description: "Unlock the 4th Infinity Dimension.",
    checkRequirement: () => InfinityDimension(4).isUnlocked,
    checkEvent: GAME_EVENT.GAME_TICK_AFTER,
    reward: "Your Achievement bonus affects Infinity Dimensions.",
    effect: () => Achievements.power,
    enhanced: {
      get reward() { return `Your Achievement bonus affects Infinity Dimensions, 
        and raise the Achievement bonus to Dimensions by ${formatPow(100)}.`;
      },
      effects: {
        infinityDimensions: () => Decimal.pow(Achievements.power, 100),
        powEffect: 100
      }
    }
  },
  {
    // Enhanced!
    // First Achievement that I ACTUALLY change??? WOW!
    id: 76,
    name: "One for each achievement",
    get description() { return `Play for ${formatInt(144)} hours (${formatInt(6)} days).`; },
    checkRequirement: () => Time.totalTimePlayed.totalHours >= 144,
    checkEvent: GAME_EVENT.GAME_TICK_AFTER,
    reward: "Very small multiplier to Antimatter Dimensions based on time played.",
    effect: () => Math.max(Math.pow(Time.totalTimePlayed.totalDays / 2, 0.1), 1),
    formatEffect: value => `${formatX(value, 2, 2)}`,
    enhanced: {
      get reward() { 
        return `Moderate multiplier to all Dimensions${Laitela.isUnlocked ? 
          `, excluding Dark Matter Dimensions,` : ``} based on time played.`},
      effect: () => Decimal.pow(Time.totalTimePlayed.totalYears, 
        Math.log10(Time.totalTimePlayed.totalYears) - 30),
      formatEffect: value => `${formatX(value, 2, 2)}`,
    }
  },
  {
    // Implemented & Enhanced!
    id: 77,
    name: "1 Million is a lot",
    get description() { return `Reach ${format(1e6)} Infinity Power.`; },
    checkRequirement: () => Currency.infinityPower.exponent >= 6,
    checkEvent: GAME_EVENT.GAME_TICK_AFTER,
    reward: "A small multiplier to IP based on Infinity Power.",
    effect: () => Decimal.max(1, Decimal.pow(Decimal.log10(Currency.infinityPower.value) / 3, 0.5)),
    cap: () => Effarig.eternityCap,
    formatEffect: value => `${formatX(value, 2, 2)}`,
    enhanced: {
      reward: "A moderate multiplier to IP based on Infinity Power.",
      effect: () => Decimal.pow(Currency.infinityPower.value, 0.001).clampMin(1),
      cap: () => Effarig.eternityCap,
      formatEffect: value => `${formatX(value, 2, 2)}`,
    }

  },
  {
    // Buffed & Enhanced! But could be better...
    id: 78,
    name: "Blink of an eye",
    get description() { return `Infinity in under ${formatInt(250)}ms.`; },
    checkRequirement: () => Time.thisInfinityRealTime.totalMilliseconds <= 250,
    checkEvent: GAME_EVENT.BIG_CRUNCH_BEFORE,
    get reward() {
      return `Start with ${format(5e40)} antimatter.`;
    },
    effect: 5e40,
    enhanced: {
      get reward() {
        return `Start with ${Achievement(55).isEnhanced ? 
          `${format(DC.E50)} (improved by Enhanced Achievement 55)` : formatInt(10)} Time Theorems.`
      },
      effect: () => DC.E1.powEffectOf(Achievement(55).enhancedEffect),
    }
  },
  {
    // Implemented & Enhanced!
    id: 81,
    name: "Game Design Is My Passion",
    get description() { return `Beat Infinity Challenge 5 in ${formatInt(15)} seconds or less.`; },
    checkRequirement: () => InfinityChallenge(5).isRunning && Time.thisInfinityRealTime.totalSeconds <= 15,
    checkEvent: GAME_EVENT.BIG_CRUNCH_BEFORE,
    get reward() {return `Reduce post-infinity cost scaling for Antimatter Dimensions by -${format(0.01, 2, 2)}.`},
    effect: 0.01,
    enhanced: {
      get reward() {return `Reduce post-infinity cost scaling for Antimatter Dimensions by -${format(0.03, 2, 2)}.`},
      effect: 0.03
    }
  },
  {
    // Implemented & Enhanced!
    id: 82,
    name: "Anti-antichallenged",
    get description() { return `Complete all ${formatInt(8)} Infinity Challenges.`; },
    checkRequirement: () => InfinityChallenges.completed.length === 8,
    checkEvent: [GAME_EVENT.INFINITY_CHALLENGE_COMPLETED, GAME_EVENT.REALITY_RESET_AFTER],
    get reward() { return `The ${formatX(2)} IP multiplier upgrade no longer spends IP.`;},
    enhanced: {
      get reward() { return `The ${formatX(2)} IP multiplier upgrade gives ${formatX(2)} its IP cost 
        instead of spending them.`;}
    }
  },
  {
    // Modified & Enhanced! Now it's slightly better than pre-release r26!
    id: 83,
    name: "YOU CAN GET 50 GALAXIES?!?!",
    get description() { return `Get ${formatInt(50)} Antimatter Galaxies.`; },
    checkRequirement: () => player.galaxies >= 50,
    checkEvent: GAME_EVENT.GALAXY_RESET_AFTER,
    get reward() { return `Every ${formatInt(10)} Antimatter Galaxies bought gives a free Tickspeed Upgrade.`; },
    effect: () => Math.floor(player.galaxies / 10),
    formatEffect: value => `+${formatInt(value, 2, 2)}`,
    enhanced: {
      reward: "Every Antimatter Galaxy bought gives a free Tickspeed Upgrade.",
      effect: () => player.galaxies,
      formatEffect: value => `+${formatInt(value, 2, 2)}`,
    }
  },
  {
    // Enhanced!
    id: 84,
    name: "I got a few to spare",
    get description() { return `Reach ${formatPostBreak("1e35000")} antimatter.`; },
    checkRequirement: () => Currency.antimatter.exponent >= 35000,
    checkEvent: GAME_EVENT.GAME_TICK_AFTER,
    reward: "Antimatter Dimensions are stronger the more unspent antimatter you have.",
    effect: () => Currency.antimatter.value.pow(0.00002).plus(1),
    formatEffect: value => `${formatX(value, 2, 2)}`,
    enhanced: {
      reward: "Antimatter Dimensions are way stronger the more unspent antimatter you have.",
      effect: () => Currency.antimatter.value.pow(0.000031).plus(1),
      formatEffect: value => `${formatX(value, 2, 2)}`
    }
  },
  {
    // Enhanced!
    id: 85,
    name: "ALL YOUR IP ARE BELONG TO US",
    get description() { return `Big Crunch for ${format(DC.E150)} Infinity Points.`; },
    checkRequirement: () => gainedInfinityPoints().exponent >= 150,
    checkEvent: GAME_EVENT.BIG_CRUNCH_BEFORE,
    get reward() { return `Additional ${formatX(4)} multiplier to Infinity Points.`; },
    effect: 4,
    enhanced: {
      get reward() { return `Additional ${formatX(DC.E1500)} multiplier to 
        Infinity Points and Eternity Points.`; },
      effect: DC.E1500
    }
  },
  {
    // Enhanced!
    id: 86,
    name: "Do you even bend time bro?",
    get description() { return `Reach ${formatX(1000)} faster per Tickspeed upgrade.`; },
    checkRequirement: () => Tickspeed.multiplier.recip().gte(1000),
    checkEvent: GAME_EVENT.GAME_TICK_AFTER,
    get reward() { return `All Galaxies are ${formatPercents(0.01)} stronger.`; },
    effect: 1.01,
    enhanced: {
      get reward() { return `All Galaxies are ${formatPercents(0.03)} stronger.`; },
      effect: 1.03
    }
  },
  {
    // Enhanced!
    id: 87,
    name: "2 MILLION INFINITIES",
    get description() { return `Infinity ${format(DC.D2E6)} times.`; },
    checkRequirement: () => Currency.infinities.gt(DC.D2E6),
    checkEvent: GAME_EVENT.GAME_TICK_AFTER,
    get reward() {
      return `Infinities more than ${formatInt(5)} seconds long
      give ${formatX(250)} more Infinities.`;
    },
    effect: 250,
    effectCondition: () => Time.thisInfinity.totalSeconds > 5,
    enhanced: {
      get reward() {
        return `Gain ${formatX(DC.D2E6)} more Infinities.`;
      },
      effect: 2000000,
    }
  },
  {
    // Enhanced!
    id: 88,
    name: "Yet another infinity reference",
    get description() {
      return `Get a ${formatX(Decimal.NUMBER_MAX_VALUE, 1, 0)} multiplier in a single Dimensional Sacrifice.`;
    },
    checkRequirement: () => Sacrifice.nextBoost.gte(Decimal.NUMBER_MAX_VALUE),
    checkEvent: GAME_EVENT.SACRIFICE_RESET_BEFORE,
    get reward() {
      return `Dimensional Sacrifice is stronger.
        ${Sacrifice.getSacrificeDescription({ "Achievement32": true, "Enhancement32": false, 
        "Achievement57": true, "Enhancement57": false, "Achievement88": false, "Enhancement88": false })} ➜
        ${Sacrifice.getSacrificeDescription({ "Achievement32": true, "Enhancement32": false, 
        "Achievement57": true, "Enhancement57": false, "Achievement88": true, "Enhancement88": false })}`;
    },
    effect: 0.1,
    enhanced: {
      get reward() {
        return `Dimensional Sacrifice is mildly stronger.
          ${Sacrifice.getSacrificeDescription({ "Achievement88": true, "Enhancement88": false})} ➜
          ${Sacrifice.getSacrificeDescription({ "Achievement32": false, "Enhancement32": true, 
          "Achievement57": false, "Enhancement57": true, "Achievement88": false, "Enhancement88": true})}. 
          This requires Achievements 32 and 57 to be Enhanced.`;
      },
      effect: 0.16
    }
  },
  {
    // Enhanced!
    id: 91,
    name: "Ludicrous Speed",
    get description() {
      return `Big Crunch for ${format(DC.E200)} Infinity Points in ${formatInt(2)} seconds or less.`;
    },
    checkRequirement: () => gainedInfinityPoints().exponent >= 200 && Time.thisInfinityRealTime.totalSeconds <= 2,
    checkEvent: GAME_EVENT.BIG_CRUNCH_BEFORE,
    get reward() {
      return Achievement(145).canBeApplied ? 
      `All Antimatter Dimensions are significantly stronger (improved by Achievement 145).` : 
      `All Antimatter Dimensions are significantly stronger in the
      first ${formatInt(5)} seconds of Infinities.`;
    },
    effect: () => Achievement(145).canBeApplied ? 300 : Math.max((5 - Time.thisInfinity.totalSeconds) * 60, 1),
    effectCondition: () => Achievement(145).canBeApplied || Time.thisInfinity.totalSeconds < 5,
    formatEffect: value => `${formatX(value, 2, 2)}`,
    enhanced: {
      get reward() {return `All Infinity Dimensions are ${formatX(DC.E10000)} stronger.`},
      effect: DC.E10000
    }
  },
  {
    // Enhanced!
    id: 92,
    name: "I brake for NOBODY!",
    get description() {
      return `Big Crunch for ${format(DC.E250)} Infinity Points in ${formatInt(20)} seconds or less.`;
    },
    checkRequirement: () => gainedInfinityPoints().exponent >= 250 && Time.thisInfinityRealTime.totalSeconds <= 20,
    checkEvent: GAME_EVENT.BIG_CRUNCH_BEFORE,
    get reward() {
      return Achievement(145).canBeApplied ? 
      `All Antimatter Dimensions are significantly stronger (improved by Achievement 145).` :
      `All Antimatter Dimensions are significantly stronger in the
      first ${formatInt(60)} seconds of Infinities.`;
    },
    effect: () => Achievement(145).canBeApplied ? 100 : Math.max((1 - Time.thisInfinity.totalMinutes) * 100, 1),
    effectCondition: () => Achievement(145).canBeApplied || Time.thisInfinity.totalMinutes < 1,
    formatEffect: value => `${formatX(value, 2, 2)}`,
    enhanced: {
      get reward() {return `All Time Dimensions are ${formatX(DC.E2500)} stronger.`},
      effect: DC.E2500
    }
  },
  {
    // Buffed & Enhanced!
    id: 93,
    name: "MAXIMUM OVERDRIVE",
    get description() { return `Big Crunch for ${format(DC.E300)} Infinity Points.`; },
    checkRequirement: () => gainedInfinityPoints().exponent >= 300,
    checkEvent: GAME_EVENT.BIG_CRUNCH_BEFORE,
    get reward() { return `Additional ${formatX(6)} multiplier to Infinity Points.`; },
    effect: 6,
    enhanced: {
      get reward() { return `Raise Infinity Points such that, for every factor of ${format(DC.E300)},
        gain ${formatX(6)} more.`},
      effect: 1.002593839 // A power effect
    }
  },
  {
    // Modified & Enhanced!
    id: 94,
    name: "4.3333 minutes of Infinity",
    get description() { return `Reach ${format(DC.E260)} Infinity Power.`; },
    checkRequirement: () => Currency.infinityPower.exponent >= 260,
    checkEvent: GAME_EVENT.GAME_TICK_AFTER,
    get reward() {
      return `Infinity Power gain ${formatX(4.3333, 4, 4)}. ` + (Achievement(145).canBeApplied ? 
        `Boost Replicanti speed by +${formatPercents(0.43333, 3, 3)} (improved by Achievement 145).` :
        `The first ${format(4.3333, 4, 4)} minutes of each Infinity boost Replicanti speed by 
        +${formatPercents(0.43333, 3, 3)} ${Time.thisInfinity.totalMinutes > 4.3333 ? `(inactive)` : `(active)`}.`);
    },
    effects: {
      infinityPowerGain: 4.3333,
      replicantiSpeed: () => Time.thisInfinity.totalMinutes <= 4.3333 || Achievement(145).canBeApplied ?
        1.43333 : 1,
    },
    enhanced: {
      get reward() {
        return `Infinity Power gain ${formatX(DC.E26000)}, and boost Replicanti speed by ${formatX(260)}.`;
      },
      effects: {
        infinityPowerGain: DC.E26000,
        replicantiSpeed: 260
      }
    }
  },
  {
    // Enhanced!
    id: 95,
    name: "Is this safe?",
    get description() { return `Gain ${format(Decimal.NUMBER_MAX_VALUE, 1, 0)} Replicanti in ${formatInt(1)} hour.`; },
    get reward() { return `You keep your Replicanti and ${formatInt(1)} Replicanti Galaxy on Infinity.`; },
    checkRequirement: () =>
      (Replicanti.amount.eq(Decimal.NUMBER_MAX_VALUE) || player.replicanti.galaxies > 0) &&
      Time.thisInfinityRealTime.totalHours <= 1,
    checkEvent: GAME_EVENT.REPLICANTI_TICK_AFTER,
    enhanced: {
      // This, with TS33, makes you lose no Galaxies on Infinity.
      reward: "You keep your Replicanti and half your Replicanti Galaxies on Infinity. " +
        "Increase your Replicanti speed based on Infinities.",
      effect: () => Currency.infinitiesTotal.value.add(2).log2(),
      formatEffect: value => `${formatX(value, 2, 2)}`
    }
  },
  {
    // Implemented & Enhanced!
    id: 96,
    name: "Time is relative",
    description: "Go Eternal.",
    checkRequirement: () => true,
    checkEvent: GAME_EVENT.ETERNITY_RESET_BEFORE,
    get reward() {
      return `Upon getting this achievement, gain ${formatInt(3)} Eternity Points. Use them wisely!`;
    },
    effect: 3,
    enhanced: {
      get reward() {
        return `Start every Reality with ${Achievement(55).isEnhanced ? `${formatPostBreak(DC.E2000)} 
          (improved by Enhanced Achievement 55)` : format(1e40)} Eternity Points, 
          and gain that amount upon Enhancing this achievement.`;
      },
      effect: () => DC.E40.powEffectOf(Achievement(55).enhancedEffect)
    }
  },
  {
    // Implemented & Enhanced!
    id: 97,
    name: "Like jumping on a lego",
    get description() { return `Get the sum of Infinity Challenge times under ${format(6.66, 2, 2)} seconds.`; },
    checkRequirement: () => Time.infinityChallengeSum.totalSeconds < 6.66,
    checkEvent: [GAME_EVENT.BIG_CRUNCH_AFTER, GAME_EVENT.REALITY_RESET_AFTER],
    get reward() { return Achievement(145).canBeApplied ? 
      "IC1's reward is raised (maxed by Achievement 145)." :
      (Time.infinityChallengeSum.totalSeconds < 0.666 ? 
      "IC1's reward is raised based on sum of IC times (capped)." : 
      "IC1's reward is raised based on sum of IC times.") 
    },
    effect: () => Achievement(145).canBeApplied ? 11.1 : 
      Math.max(6.66 / Math.max(Time.infinityChallengeSum.totalSeconds, 0.6), 1),
    formatEffect: value => `^${format(value, 2, 2)}`,
    enhanced: {
      get reward() { return `IC1 and IC3's reward is raised ${formatPow(16.66, 2, 2)}.`},
      effect: 16.66
    }
  },
  {
    // Implemented & Enhanced!
    id: 98,
    name: "0 degrees from Infinity",
    description: "Unlock the 8th Infinity Dimension.",
    checkRequirement: () => InfinityDimension(8).isUnlocked,
    checkEvent: GAME_EVENT.GAME_TICK_AFTER,
    reward: "Infinity Dimensions and Replicanti upgrades no longer spend Infinity Points.",
    enhanced: {
      get reward() { return `Infinity Dimensions and Replicanti upgrades no longer spend Infinity Points, and
        raise their costs by ${formatPow(0.98, 2, 2)}.` },
      effect: 0.98
    }
  },

  {
    // Implemented! Likely the messiest code, but it's just multiplication. & Enhanced!
    id: 101,
    name: "8 nobody got time for that",
    description: "Eternity without buying Antimatter Dimensions 1-7.",
    checkRequirement: () => player.requirementChecks.eternity.onlyAD8,
    checkEvent: GAME_EVENT.ETERNITY_RESET_BEFORE,
    reward: "8th ADs are stronger based on purchased ADs.",
    effect: () => Laitela.continuumActive ? Decimal.pow(AntimatterDimension(1).continuumAmount * AntimatterDimension(2).continuumAmount *
    AntimatterDimension(3).continuumAmount * AntimatterDimension(4).continuumAmount * AntimatterDimension(5).continuumAmount * 
    AntimatterDimension(6).continuumAmount * AntimatterDimension(7).continuumAmount, AntimatterDimension(8).continuumAmount / 2000).plus(1) : 
    Decimal.pow(AntimatterDimension(1).bought * AntimatterDimension(2).bought * AntimatterDimension(3).bought * 
      AntimatterDimension(4).bought * AntimatterDimension(5).bought * AntimatterDimension(6).bought * 
      AntimatterDimension(7).bought, AntimatterDimension(8).bought / 2000).plus(1),
    formatEffect: value => `${formatX(value, 2, 2)}`,
    enhanced: {
      reward: "8th ADs and IDs are stronger based on purchased ADs.",
      effect: () => Laitela.continuumActive ? Decimal.pow(AntimatterDimension(1).continuumAmount * AntimatterDimension(2).continuumAmount *
        AntimatterDimension(3).continuumAmount * AntimatterDimension(4).continuumAmount * AntimatterDimension(5).continuumAmount * 
        AntimatterDimension(6).continuumAmount * AntimatterDimension(7).continuumAmount, AntimatterDimension(8).continuumAmount / 800).plus(1) : 
        Decimal.pow(AntimatterDimension(1).bought * AntimatterDimension(2).bought * AntimatterDimension(3).bought * 
        AntimatterDimension(4).bought * AntimatterDimension(5).bought * AntimatterDimension(6).bought * 
        AntimatterDimension(7).bought, AntimatterDimension(8).bought / 800).plus(1),
      formatEffect: value => `${formatX(value, 2, 2)}`,
    }
  },
  {
    // Implemented (in theory) & Enhanced (in theory)!
    id: 102,
    name: "This mile took an eternity",
    description: "Get all Eternity milestones.",
    checkRequirement: () => EternityMilestone.all.every(m => m.isReached),
    checkEvent: GAME_EVENT.GAME_TICK_AFTER,
    get reward() {
      return `Improve offline generation milestones to give ${formatPercents(0.9)} of their respective resource.`
    },
    effect: 0.9,
    enhanced: {
      get reward() {
        return `Improve offline generation milestones to give ${formatPercents(1)} of their respective resource, they
          are always active, and multiply EP, Infinities, and Eternities generation by ${formatInt(100000)}.`
      },
      effects: {
        offlineMultiplier: 1,
        multiplier: 100000
      }
    }
  },
  {
    // Improved & Enhanced!
    id: 103,
    name: "Tätä saavutusta ei ole olemassa II",
    get description() { return `Reach ${formatPostBreak(DC.D9_99999E999, 5, 0)} Infinity Points.`; },
    checkRequirement: () => Currency.infinityPoints.exponent >= 1000,
    checkEvent: GAME_EVENT.GAME_TICK_AFTER,
    get reward() {
      return TimeStudy(111).canBeApplied ? 
      `Make the Infinity Point formula better. log(x)/${formatInt(285)} ➜ log(x)/${formatFloat(284.8, 1)}` : 
      `Make the Infinity Point formula better. log(x)/${formatInt(308)} ➜ log(x)/${formatFloat(307.8, 1)}`;
    },
    effect: 0.2,
    enhanced: {
      get reward() {
        return TimeStudy(111).canBeApplied ? 
        `Make the Infinity Point formula much better. log(x)/${formatInt(285)} ➜ log(x)/${formatInt(280)}` : 
        `Make the Infinity Point formula much better. log(x)/${formatInt(308)} ➜ log(x)/${formatInt(303)}`;
      },
      effect: 5,
    }
  },
  // Buffed & Enhanced!
  {
    id: 104,
    name: "That wasn't an eternity",
    get description() { return `Eternity in under ${formatInt(30)} seconds.`; },
    checkRequirement: () => Time.thisEternity.totalSeconds <= 30,
    checkEvent: GAME_EVENT.ETERNITY_RESET_BEFORE,
    get reward() { return `Start Eternities with ${format(5e40)} Infinity Points.`; },
    effect: 5e40,
    enhanced: {
      get reward() { return `When unlocking Dilation, start with ${Achievement(55).isEnhanced ? 
        `${format(DC.C2P200, 2, 2)} Tachyon Particles (improved by Enhanced Achievement 55).` : 
        `${formatInt(16)} Tachyon Particles.`}`},
      effect: () => DC.D16.powEffectOf(Achievement(55).enhancedEffect),
    }
  },
  {
    // Enhanced!
    id: 105,
    name: "Infinite Time",
    get description() { return `Have ${formatInt(308)} Tickspeed upgrades from Time Dimensions.`; },
    checkRequirement: () => player.tickGainedFromShards >= 308,
    checkEvent: GAME_EVENT.GAME_TICK_AFTER,
    reward: "Time Dimensions gain a multiplier based on tickspeed.",
    effect: () => Tickspeed.perSecond.pow(0.000005),
    formatEffect: value => `${formatX(value, 2, 2)}`,
    enhanced: {
      reward: "Time Dimensions gain a bigger multiplier based on tickspeed.",
      effect: () => Tickspeed.perSecond.pow(0.000008),
      formatEffect: value => `${formatX(value, 2, 2)}`,
    }
  },
  {
    // Implemented & Enhanced!
    id: 106,
    name: "The swarm",
    get description() { return `Get ${formatInt(10)} Replicanti Galaxies in ${formatInt(15)} seconds.`; },
    checkRequirement: () => Replicanti.galaxies.total >= 10 && Time.thisInfinity.totalSeconds <= 15,
    checkEvent: GAME_EVENT.REPLICANTI_TICK_AFTER,
    get reward() {return `Replicanti speed ${formatX(2)} if you have bought less than ${formatInt(10)} 
      Replicanti Galaxies ${Replicanti.galaxies.bought >= 10 ? `(inactive)` : `(active)`}.`},
    effect: 2,
    effectCondition: () => Replicanti.galaxies.bought < 10,
    enhanced: {
      get reward() {return `Replicanti speed ${formatX(5000000)} if you haven't bought more than ${formatInt(5000)} 
      Replicanti Galaxies ${Replicanti.galaxies.bought > 5000 ? `(inactive)` : `(active)`}.`},
      effect: 5000000,
      effectCondition: () => Replicanti.galaxies.bought <= 5000,
    }
  },
  {
    // Implemented!
    id: 107,
    name: "Do you really need a guide for this?",
    get description() { return `Eternity with less than ${formatInt(10)} Infinities.`; },
    checkRequirement: () => Currency.infinities.lt(10),
    checkEvent: GAME_EVENT.ETERNITY_RESET_BEFORE,  
    reward: "Boost Infinity Dimensions the more Infinities you have.",
    effect: () => Decimal.pow(Currency.infinitiesTotal.value.clampMin(1), LOG10_2 / 2).powEffectOf(TimeStudy(31)),
    formatEffect: value => {
      // Since TS31 is already accounted for in the effect prop, we need to "undo" it to display the base value here
      const mult = formatX(value, 2, 2);
      return TimeStudy(31).canBeApplied
        ? `${formatX(value.pow(1 / TimeStudy(31).effectValue), 2, 1)} (After TS31: ${mult})`
        : mult;
    },
    enhanced: {
      reward: "Greatly boost Infinity Dimensions the more Infinities you have.",
      effect: () => Decimal.pow(Currency.infinitiesTotal.value.clampMin(1), 25).powEffectOf(TimeStudy(31)),
      formatEffect: value => {
        // Since TS31 is already accounted for in the effect prop, we need to "undo" it to display the base value here
        const mult = formatX(value, 2, 2);
        return TimeStudy(31).canBeApplied
          ? `${formatX(value.pow(1 / TimeStudy(31).effectValue), 2, 1)} (After TS31: ${mult})`
          : mult;
    }
    }
  },
  {
    // Implemented!
    id: 108,
    name: "We COULD afford 9",
    get description() { return `Eternity with exactly ${formatInt(9)} Replicanti.`; },
    checkRequirement: () => Replicanti.amount.round().eq(9),
    checkEvent: GAME_EVENT.ETERNITY_RESET_BEFORE,
    get reward() {
      return `You'll always have at least ${formatInt(9)} Replicanti. Gain ${formatX(2)} 
        Replicanti speed ${Achievement(145).canBeApplied ? `(improved by Achievement 145)` : 
        `the first ${formatInt(9)} seconds of each Eternity 
        ${Time.thisEternity.totalSeconds > 9 ? `(inactive)` : `(active)`}`}.`;
    },
    effects: {
      minReplicanti: 9,
      replicantiSpeed: 2
    },
    // This check is just in case
    effectCondition: () => player.replicanti.unl,
    enhanced: {
      get reward() {
        return `You'll always have at least ${format(Number.MAX_VALUE, 1, 1)} Replicanti. Gain ${formatX(999)} 
          Replicanti speed.`;
      },
      effects: {
        minReplicanti: Number.MAX_VALUE,
        replicantiSpeed: 999
      },
    }
  },

  {
    // Enhanced!
    id: 111,
    name: "Yo dawg, I heard you liked infinities...",
    get description() {
      return `Have all your Infinities in your past ${formatInt(10)} Infinities be at least
      ${format(Decimal.NUMBER_MAX_VALUE, 1, 0)} times higher Infinity Points than the previous one.`;
    },
    checkRequirement: () => {
      if (player.records.recentInfinities.some(i => i[0] === Number.MAX_VALUE)) return false;
      const infinities = player.records.recentInfinities.map(run => run[2]);
      for (let i = 0; i < infinities.length - 1; i++) {
        if (infinities[i].lt(infinities[i + 1].times(Decimal.NUMBER_MAX_VALUE))) return false;
      }
      return true;
    },
    checkEvent: GAME_EVENT.BIG_CRUNCH_AFTER,
    reward: "Your antimatter doesn't reset on Dimension Boosts or Antimatter Galaxies.",
    enhanced: {
      reward: "Your antimatter doesn't reset on Dimension Boosts or Antimatter Galaxies, and gain free " + 
        "Dimension Boosts equal to your Antimatter Galaxy amount.",
      effect: () => player.galaxies,
      formatEffect: value => `+${formatInt(value, 2, 2)}`
    }
  },
  {
    // Implemented & Enhanced!
    id: 112,
    name: "Never again",
    get description() { return `Get the sum of Infinity Challenge times below ${formatInt(750)}ms.`; },
    checkRequirement: () => Time.infinityChallengeSum.totalMilliseconds < 750,
    checkEvent: [GAME_EVENT.BIG_CRUNCH_AFTER, GAME_EVENT.REALITY_RESET_AFTER],
    reward: "IC1 and IC6 rewards affect Time Dimensions at a greatly reduced rate.",
    effect: () => Decimal.pow(InfinityChallenge(1).reward.effectValue.timesEffectOf(InfinityChallenge(6).reward), 0.004),
    formatEffect: value => `${formatX(value, 2, 2)}`,
    enhanced: {
      reward: "IC1, IC3 and IC6 rewards affect Time Dimensions at a greatly reduced rate.",
      effect: () => Decimal.pow(InfinityChallenge(1).reward.effectValue.timesEffectOf(InfinityChallenge(6).reward), 0.006).
        times(InfinityChallenge(3).reward.effectValue.pow(0.0006)),
      formatEffect: value => `${formatX(value, 2, 2)}`,
    }
  },
  {
    // Modified & Enhanced!
    id: 113,
    name: "Eternities are the new infinity",
    get description() { return `Eternity in under ${formatInt(250)}ms.`; },
    checkRequirement: () => Time.thisEternity.totalMilliseconds <= 250,
    checkEvent: GAME_EVENT.ETERNITY_RESET_BEFORE,
    get reward() { return Achievement(145).canBeApplied ? 
      `Gain more Eternities (maxed by Achievement 145).` :
      `Gain more Eternities based on your fastest time, up to ${formatX(5)}.`; },
    effect: () => Achievement(145).canBeApplied ? 5 : 
      Math.clampMin(Math.floor(500 / Math.max(player.records.bestEternity.time, 100)), 2),
    formatEffect: value => {
      const mult = formatX(value);
      if (value < 5) {
        const nextAt = Math.floor(500 / (value + 1));
        return mult + ` (Next at ${formatInt(nextAt)} ms)`;
      }
      return mult;
    },
    enhanced: {
      reward: "Gain more Eternities based on the length of your current Eternity.",
      effect: () => Math.pow(Time.thisEternity.totalSeconds, 0.05),
      formatEffect: value => `${formatX(value, 2, 2)}`
    }
  },
  {
    // I find this one funny, so it'll stay. Enhanced!
    id: 114,
    name: "You're a mistake",
    description: "Fail an Eternity Challenge.",
    checkRequirement: () => true,
    checkEvent: GAME_EVENT.CHALLENGE_FAILED,
    reward: "A fading sense of accomplishment.",
    effect: () => "Sense of accomplishment (fading)",
    enhanced: {
      reward: "An overwelming unfading sense of accomplishment. This can be Enhanced for free.",
      effect: () => "Overwelming sense of accomplishment",
    }
  },
  {
    // Implemented & Enhanced!
    id: 115,
    name: "I wish I had gotten 7 eternities",
    description: "Start an Infinity Challenge inside an Eternity Challenge.",
    checkEvent: GAME_EVENT.ACHIEVEMENT_EVENT_OTHER,
    get reward() {
      return `Infinities no longer reset Infinity power nor ID amounts, and, if their autobuyers are on,
       keep up to ${formatInt(200)} Dimension Boosts and ${formatInt(50)} Antimatter Galaxies between them.`
    },
    enhanced: {
      get reward() { return `Infinities no longer reset anything. Keep up to ${formatInt(1000000)} 
        Dimension Boosts and ${formatInt(5000)} Antimatter & Replicanti Galaxies between Eternities, except on Challenges or Dilation,
        and gain ${formatInt(77777)} times more Eternities.`},
      effects: {
        dimBoostsKept: 1000000,
        galaxiesKept: 5000,
        eternityMultiplier: 77777
      }
    }
  },
  {
    // Enhanced!
    id: 116,
    name: "Do I really need to infinity",
    get description() { return `Eternity with only ${formatInt(1)} Infinity.`; },
    checkRequirement: () => Currency.infinities.lte(1),
    checkEvent: GAME_EVENT.ETERNITY_RESET_BEFORE,
    reward: "Multiplier to Infinity Points based on Infinities.",
    effect: () => Decimal.pow(Currency.infinitiesTotal.value.clampMin(1), LOG10_2 / 4).powEffectOf(TimeStudy(31)),
    cap: () => Effarig.eternityCap,
    formatEffect: value => {
      // Since TS31 is already accounted for in the effect prop, we need to "undo" it to display the base value here
      const mult = formatX(value, 2, 2);
      return TimeStudy(31).canBeApplied
        ? `${formatX(value.pow(1 / TimeStudy(31).effectValue), 2, 1)} (After TS31: ${mult})`
        : mult;
    },
    enhanced: {
      reward: "Infinities multiply your Infinity points and Eternity Points.",
      effect: () => Decimal.pow(Currency.infinitiesTotal.value.clampMin(1), TimeStudy(31).effectOrDefault(1)),
      cap: () => Effarig.eternityCap,
      formatEffect: value => {
        // Since TS31 is already accounted for in the effect prop, we need to "undo" it to display the base value here
        const mult = formatX(value, 2, 2);
        return TimeStudy(31).canBeApplied
          ? `${formatX(value.pow(1 / TimeStudy(31).effectValue), 2, 1)} (After TS31: ${mult})`
          : mult;
      }
    }
  },
  {
    // Enhanced!
    id: 117,
    name: "Costco sells Dimboosts now!",
    get description() { return `Bulk buy ${formatInt(750)} Dimension Boosts at once.`; },
    checkRequirement: ([bulk]) => bulk >= 750,
    checkEvent: GAME_EVENT.DIMBOOST_AFTER,
    get reward() {
      return `The multiplier from Dimension Boosts to Antimatter Dimensions is ${formatPercents(0.01)} higher.`;
    },
    effect: 1.01,
    enhanced: {
      get reward() {
        return `The multiplier from Dimension Boosts to Antimatter Dimensions is ${formatX(1e10)} higher.`;
      },
      effect: 1e10,
    }
  },
  {
    // Enhanced!
    id: 118,
    name: "IT'S OVER 9000",
    get description() { return `Get a total Dimensional Sacrifice multiplier of ${formatPostBreak(DC.E9000)}.`; },
    checkRequirement: () => Sacrifice.totalBoost.exponent >= 9000,
    checkEvent: GAME_EVENT.SACRIFICE_RESET_AFTER,
    reward: `Dimensional Sacrifice doesn't reset your Antimatter Dimensions
      and the Autobuyer activates every tick if turned on.`,
    enhanced: {
      reward: `Dimensional Sacrifice doesn't reset your Antimatter Dimensions
        and the Autobuyer activates every tick if turned on. It now affects Tickspeed at a reduced rate.
        This counts as 2 Achievements Enhanced.`,
      effect: () => Sacrifice.totalBoost.pow(-0.04),
      formatEffect: value => `${formatX(value.recip(), 3, 3)}`
    }
  },
  
  {
    // Implemented & Enhanced!
    id: 121,
    name: "Can you get infinite IP?",
    get description() { return `Reach ${formatPostBreak("1e30008")} Infinity Points.`; },
    checkRequirement: () => Currency.infinityPoints.exponent >= 30008,
    checkEvent: GAME_EVENT.GAME_TICK_AFTER,
    get reward() {
      return `Improve the IP multiplier upgrade: ${formatX(2)} ➜ ${formatX(2.01, 2, 2)}.`;
    },
    effect: 2.01,
    enhanced: {
      get reward() {
        return `Greatly improve the IP multiplier upgrade: ${formatX(2)} ➜ ${formatX(3)}.`;
      },
      effect: 3,
    }
  },
  {
    // Implemented & Enhanced! It'll appear in multiplier tab as part of 'purchases' instead of in 'achievements'.
    id: 122,
    name: "You're already dead.",
    description: "Eternity without buying Antimatter Dimensions 2-8.",
    checkRequirement: () => player.requirementChecks.eternity.onlyAD1,
    checkEvent: GAME_EVENT.ETERNITY_RESET_BEFORE,
    get reward() {
      return `Multiply the Buy 10 Dimensions multiplier for 1st Antimatter Dimensions by ${formatX(1.5, 1, 1)}`;
    },
    effect: () => DC.D1_5.pow((Laitela.continuumActive ? AntimatterDimension(1).continuumAmount : AntimatterDimension(1).bought)
       / 10).pow(getAdjustedGlyphEffect("effarigforgotten")).powEffectOf(InfinityUpgrade.buy10Mult.chargedEffect).
       pow(ImaginaryUpgrade(14).effectOrDefault(1)),
    formatEffect: value => `${formatX(value, 2, 2)}`,
    enhanced: {
      get reward() {
        return `Multiply the Buy 10 Dimensions multiplier for 1st Antimatter Dimensions by ${formatX(100)}`;
      },
      effect: () => DC.E2.pow((Laitela.continuumActive ? AntimatterDimension(1).continuumAmount : AntimatterDimension(1).bought)
         / 10).pow(getAdjustedGlyphEffect("effarigforgotten")).powEffectOf(InfinityUpgrade.buy10Mult.chargedEffect).
         pow(ImaginaryUpgrade(14).effectOrDefault(1)),
      formatEffect: value => `${formatX(value, 2, 2)}`,
    }
  },
  {
    // Implemented & Enhanced!
    id: 123,
    name: "5 more eternities until the update",
    get description() { return `Complete ${formatInt(50)} unique Eternity Challenge tiers.`; },
    checkRequirement: () => EternityChallenges.completions >= 50,
    checkEvent: GAME_EVENT.ETERNITY_RESET_AFTER,
    get reward() {
      return `Time Dimensions are ${formatPercents(0.12)} stronger for every unique Eternity Challenge tier completed.`;
    },
    effect: () => Math.pow(1.12, EternityChallenges.completions),
    formatEffect: value => `${formatX(value, 2, 2)}`,
    enhanced: {
      get reward() {
        return `Time Dimensions are raised by +${formatPow(0.0005, 4, 4)} for every unique Eternity Challenge tier completed.`;
      },
      effect: () => 1 + 0.0005 * EternityChallenges.completions,
      formatEffect: value => `${formatPow(value, 2, 2)}`,
    }
  },
  {
    // Implemented & Enhanced!
    id: 124,
    name: "Long lasting relationship",
    get description() {
      return `Have your Infinity Power per second exceed your Infinity Power
      for ${formatInt(60)} consecutive seconds during a single Infinity.`;
    },
    checkRequirement: () => Time.timeWithExcessIPowerProd.totalSeconds >= 60,
    checkEvent: GAME_EVENT.GAME_TICK_AFTER,
    reward: "1st Infinity Dimensions are stronger the longer your production surpasses " + 
      "your current Infinity Power. Slows down after 60 seconds.",
    effect() {
      const excessTimeProduction = Time.timeWithExcessIPowerProd.totalSeconds;
      return excessTimeProduction >= 60 ?
      Math.pow(2, 180) * Math.pow(excessTimeProduction - 59, 0.5) : 
      Math.pow(8, excessTimeProduction)
    },
    formatEffect: value => `${formatX(value, 2, 2)}`,
    enhanced: {
      reward: "1st Infinity Dimensions are significantly stronger the longer your Reality lasts.",
      effect: () => Decimal.pow(Time.thisReality.totalSeconds, 6000),
      formatEffect: value => `${formatX(value, 2, 2)}`,
    }
  },
  {
    // Enhanced!
    id: 125,
    name: "Like feasting on a behind",
    get description() {
      return `Reach ${format(DC.E90)} Infinity Points without having any Infinities
      or any 1st Antimatter Dimensions in your current Eternity.`;
    },
    checkRequirement: () => Currency.infinityPoints.exponent >= 90 &&
      player.requirementChecks.eternity.noAD1 && Currency.infinities.eq(0),
    checkEvent: GAME_EVENT.GAME_TICK_AFTER,
    reward: "Infinity Point multiplier based on time spent this Infinity.",
    effect() {
      const thisInfinity = Time.thisInfinity.totalSeconds * 10 + 1;
      return DC.D2.pow(Math.log(thisInfinity) * Math.min(Math.pow(thisInfinity, 0.11), 500));
    },
    cap: () => Effarig.eternityCap,
    formatEffect: value => `${formatX(value, 2, 2)}`,
    enhanced: {
      reward: "Big Infinity Point multiplier based on time spent this Infinity.",
      effect() {
        const thisInfinity = Time.thisInfinity.totalSeconds * 10 + 1;
        return DC.D3.pow(Math.log2(thisInfinity) * Math.min(Math.pow(thisInfinity, 0.11), 10000));
      },
      cap: () => Effarig.eternityCap,
      formatEffect: value => `${formatX(value, 2, 2)}`,
    }
  },
  {
    // Enhanced!
    id: 126,
    name: "Popular music",
    get description() { return `Have ${formatInt(180)} times more Replicanti Galaxies than Antimatter Galaxies.`; },
    checkRequirement: () => Replicanti.galaxies.total >= 180 * player.galaxies && player.galaxies > 0,
    checkEvent: GAME_EVENT.GAME_TICK_AFTER,
    get reward() {
      return Achievement(108).isUnlocked && !Achievement(108).isCursed ? `Replicanti Galaxies divide your Replicanti 
        by ${format(Decimal.NUMBER_MAX_VALUE, 1, 0)} instead of resetting them to ${
          Achievement(108).isEnhanced ? format(Decimal.NUMBER_MAX_VALUE, 1, 0) : formatInt(9)}.` : 
        `Replicanti Galaxies divide your Replicanti by ${format(Decimal.NUMBER_MAX_VALUE, 1, 0)}
        instead of resetting them to ${formatInt(1)}.`;
    },
    enhanced: {
      reward: "Replicanti Galaxies no longer divide or reset Replicanti. This Achievement can be Enhanced for free."
    }
  },
  {
    // Implemented! And modified! And Enhanced!
    id: 127,
    name: "But I wanted another prestige layer...",
    get description() { return `Reach ${format(Decimal.NUMBER_MAX_VALUE, 1, 0)} Eternity Points.`; },
    checkRequirement: () => Currency.eternityPoints.gte(Decimal.NUMBER_MAX_VALUE),
    checkEvent: GAME_EVENT.GAME_TICK_AFTER,
    get reward() { return `Time Dimensions and the ${formatX(5)} EP upgrade no longer spend EP.` },
    enhanced: {
      get reward() { return `Time Dimensions and the ${formatX(5)} EP upgrade give ${formatX(3)} their 
        EP cost instead of spending them.` },
    }
  },
  {
    // Enhanced!
    id: 128,
    name: "What do I have to do to get rid of you",
    get description() { return `Reach ${formatPostBreak("1e22000")} Infinity Points without any Time Studies.`; },
    checkRequirement: () => Currency.infinityPoints.exponent >= 22000 && player.timestudy.studies.length === 0,
    checkEvent: GAME_EVENT.GAME_TICK_AFTER,
    reward: "Time Dimensions are multiplied by the number of Time Studies you have.",
    effect: () => Math.max(player.timestudy.studies.length, 1),
    formatEffect: value => `${formatX(value)}`,
    enhanced: {
      get reward() { return `Time Dimensions are multiplied by ${formatPostBreak("1e1000")} for every 
        Time Study you have.` },
      effect: () => DC.E1000.pow(player.timestudy.studies.length),
      formatEffect: value => `${formatX(value)}`,
    }
  },

  {
    // Buffed & Enhanced!
    id: 131,
    name: "No ethical consumption",
    get description() { return `Get ${format(DC.D2E9)} Banked Infinities.`; },
    checkRequirement: () => Currency.infinitiesBanked.gt(DC.D2E9),
    checkEvent: [GAME_EVENT.ETERNITY_RESET_AFTER, GAME_EVENT.SAVE_CONVERTED_FROM_PREVIOUS_VERSION],
    get reward() {
      return `After Eternity you permanently keep ${formatPercents(0.15)} of your Infinities as Banked Infinities.`;
    },
    effect: () => Currency.infinities.value.times(0.15).floor(),
    enhanced: {
      get reward() {
        return `After Eternity you permanently keep ${formatPercents(0.95)} of your Infinities as Banked Infinities,
          and, as long as this is Enhanced, they persist between Realities.`;
      },
      effect: () => Currency.infinities.value.times(0.95).floor(),
    }
  },
  {
    // Buffed & Enhanced!
    id: 132,
    name: "Unique snowflakes",
    get description() {
      return `Have ${formatInt(569)} Antimatter Galaxies without gaining any
        Replicanti Galaxies in your current Eternity.`;
    },
    checkRequirement: () => player.galaxies >= 569 && player.requirementChecks.eternity.noRG,
    checkEvent: GAME_EVENT.GALAXY_RESET_AFTER,
    reward: "Gain a multiplier to Tachyon Particle and Dilated Time gain based on " + 
      "Antimatter Galaxies." ,
    effect: () => 1.22 * Math.max(Math.pow(player.galaxies, 0.045), 1),
    formatEffect: value => `${formatX(value, 2, 2)}`,
    enhanced: {
      reward: "Gain a bigger multiplier to Tachyon Particle and Dilated Time gain based on " +
        "Antimatter Galaxies.",
      effect: () => 1.22 * player.galaxies,
      formatEffect: value => `${formatX(value, 2, 2)}`,
    }
  },
  {
    // Enhanced!
    id: 133,
    name: "I never liked this infinity stuff anyway",
    get description() {
      return `Reach ${formatPostBreak(DC.E200000)} Infinity Points without
      buying any Infinity Dimensions or the ${formatX(2)} Infinity Point multiplier.`;
    },
    checkRequirement: () =>
      Array.dimensionTiers.map(InfinityDimension).every(dim => dim.baseAmount === 0) &&
      player.IPMultPurchases === 0 &&
      Currency.infinityPoints.exponent >= 200000,
    checkEvent: GAME_EVENT.GAME_TICK_AFTER,
    reward: "You start Eternities with all Infinity Challenges unlocked and completed.",
    enhanced: {
      reward: "You start Eternities with all Infinity Challenges unlocked and completed, and all Realities with " +
        "a fully purchased Time Study tree. This requires fully completing Hard V and 4 Triad Studies unlocked.",
    }
  },
  {
    // Enhanced!
    id: 134,
    name: "When will it be enough?",
    get description() { return `Reach ${formatPostBreak(DC.E18000)} Replicanti.`; },
    checkRequirement: () => Replicanti.amount.exponent >= 18000,
    checkEvent: GAME_EVENT.GAME_TICK_AFTER,
    get reward() {
      return `You gain Replicanti ${formatInt(2)} times faster under ${format(replicantiCap(), 1)} Replicanti.`;
    },
    effect: 2,
    // Why was this not done?
    effectCondition: () => Replicanti.amount.lte(replicantiCap()),
    enhanced: {
      reward: "Gain Replicanti faster based on your Replicanti cap without TS192.",
      effect: () => replicantiCap().log10() ** 2,
      formatEffect: value => `${formatX(value, 2, 2)}`
    }
  },
  {
    // Implemented & Enhanced!
    id: 135,
    name: "Faster than a potato^286078",
    get description() { return `Get more than ${formatPostBreak("1e8296262")} ticks per second.`; },
    checkRequirement: () => Tickspeed.current.exponent <= -8296262,
    checkEvent: GAME_EVENT.GAME_TICK_AFTER,
    get reward() {
      return `Tickspeed is ${formatX(2)} faster for every Tachyon Galaxy obtained.`;
    },
    effect: () => DC.D2.pow(player.dilation.totalTachyonGalaxies).recip(),
    formatEffect: value => `${formatX(value.recip(), 1, 1)}`,
    enhanced: {
      reward: "Increase the softcap to Tickspeed Upgrades from Time Dimensions by your current Tachyon " +
        "Galaxy amount.",
      effect: () => player.dilation.totalTachyonGalaxies,
      formatEffect: value => `+${formatInt(value)}`,
    }
  },
  {
    // Implemented & Enhanced!
    id: 136,
    name: "I told you already, time is relative",
    description: "Dilate time.",
    checkEvent: GAME_EVENT.ACHIEVEMENT_EVENT_OTHER,
    reward: "Eternities no longer reset Time shards nor TD amounts, unless entering or exiting Eternity Challenges," +
      " or Dilating.",
    enhanced: {
      reward: "Eternities no longer reset anything, unless entering or exiting challenges or Dilating, and " +
        "respeccing Studies can be done at any time. This can be Enhanced for free, but " + 
        "requires Enhanced Achievement 115."
    }
  },
  {
    // Enhanced!
    id: 137,
    name: "Now you're thinking with dilation!",
    get description() {
      return `Get ${formatPostBreak("1e260000")} antimatter
      in ${formatInt(1)} minute or less while Dilated.`;
    },
    checkRequirement: () =>
      Currency.antimatter.exponent >= 260000 &&
      Time.thisEternity.totalMinutes <= 1 &&
      player.dilation.active,
    checkEvent: GAME_EVENT.GAME_TICK_AFTER,
    get reward() { return `Gain ${formatX(2)} Dilated Time and Time Theorems while Dilated.`; },
    effect: () => (player.dilation.active ? 2 : 1),
    enhanced: {
      get reward() { return `Gain ${formatX(100000)} Dilated Time and Time Theorems.`; },
      effect: 100000,
    }
  },
  {
    // Enhanced!
    id: 138,
    name: "This is what I have to do to get rid of you.",
    get description() {
      return `Reach ${formatPostBreak("1e26000")} Infinity Points without any Time Studies while Dilated.`;
    },
    checkRequirement: () =>
      player.timestudy.studies.length === 0 &&
      player.dilation.active &&
      Currency.infinityPoints.exponent >= 26000,
    checkEvent: GAME_EVENT.GAME_TICK_AFTER,
    reward: "Removes the downsides from Time Study 131 and 133 in the Active and Idle Time Study paths.",
    enhanced: {
      get reward() {
        return `Remove the downsides and strengthen the effects of Time Studies 131 and 133. This counts as
          ${formatInt(3)} Achievements Enhanced.`;
      },
      // This will directly multiply the values of the Time Studies.
      effect: 1.2
    }
  },

  // ----------------------------------------------------------------------
  // Enhanced rewards later than this point won't be developed until later.

  {
    id: 141,
    name: "Snap back to reality",
    description: "Make a new Reality.",
    checkRequirement: () => true,
    checkEvent: GAME_EVENT.REALITY_RESET_BEFORE,
    get reward() {
      return `${formatX(4)} Infinity Point gain, and increase the multiplier for buying ${formatInt(10)}
      Antimatter Dimensions by +${format(0.1, 0, 1)}.`;
    },
    effects: {
      ipGain: 4,
      buyTenMult: 0.1
    }
  },
  {
    id: 142,
    name: "How does this work?",
    description: "Unlock the automator.",
    checkRequirement: () => Player.automatorUnlocked,
    checkEvent: [GAME_EVENT.REALITY_RESET_AFTER, GAME_EVENT.REALITY_UPGRADE_BOUGHT, GAME_EVENT.PERK_BOUGHT,
      GAME_EVENT.BLACK_HOLE_UNLOCKED],
    get reward() { return `Dimension Boosts are ${formatPercents(0.5)} stronger.`; },
    effect: 1.5,
  },
  {
    id: 143,
    name: "Yo dawg, I heard you liked reskins...",
    get description() {
      return `Have all your Eternities in your past ${formatInt(10)} Eternities be at least
      ${format(Decimal.NUMBER_MAX_VALUE, 1, 0)} times higher Eternity Points than the previous one.`;
    },
    checkRequirement: () => {
      if (player.records.recentEternities.some(i => i[0] === Number.MAX_VALUE)) return false;
      const eternities = player.records.recentEternities.map(run => run[2]);
      for (let i = 0; i < eternities.length - 1; i++) {
        if (eternities[i].lt(eternities[i + 1].times(Decimal.NUMBER_MAX_VALUE))) return false;
      }
      return true;
    },
    checkEvent: GAME_EVENT.ETERNITY_RESET_AFTER,
    reward: "Galaxies no longer reset Dimension Boosts."
  },
  {
    // Implemented!
    id: 144,
    name: "Is this an Interstellar reference?",
    description: "Unlock the Black Hole.",
    checkRequirement: () => BlackHole(1).isUnlocked,
    checkEvent: GAME_EVENT.BLACK_HOLE_UNLOCKED,
    reward: "Time Dilation rebuyables no longer spend Dilated Time.",
  },
  {
    // Modified!
    id: 145,
    name: "Are you sure these are the right way around?",
    description: "Have either Black Hole interval smaller than its duration.",
    checkRequirement: () => BlackHoles.list.some(bh => bh.interval < bh.duration),
    checkEvent: GAME_EVENT.BLACK_HOLE_UPGRADE_BOUGHT,
    get reward() { return `Black Hole intervals are ${formatPercents(0.1)} shorter. 
      Pre-reality effects that are temporary or based on fastest time are always maximized.`; },
    effect: 0.9
  },
  {
    // Buffed! For real!
    id: 146,
    name: "Perks of living",
    description: "Have all Perks bought.",
    checkRequirement: () => player.reality.perks.size === Perks.all.length,
    checkEvent: GAME_EVENT.PERK_BOUGHT,
    get reward() { return `+${formatPercents(0.05)} Glyph rarity.`; },
    effect: 5
  },
  {
    id: 147,
    name: "Master of Reality",
    description: "Have all Reality upgrades bought.",
    checkRequirement: () => RealityUpgrades.allBought,
    checkEvent: GAME_EVENT.REALITY_UPGRADE_BOUGHT,
    reward: "Unlock Teresa, the Celestial of Reality."
  },
  {
    id: 148,
    name: "Royal flush",
    description: "Reality with one of each basic Glyph type.",
    checkRequirement: () => BASIC_GLYPH_TYPES
      .every(type => Glyphs.activeList.some(g => g.type === type)),
    checkEvent: GAME_EVENT.REALITY_RESET_BEFORE,
    reward: "Gained Glyph level is increased by number of distinct Glyph types equipped.",
    effect: () => (new Set(Glyphs.activeWithoutCompanion.map(g => g.type))).size,
    formatEffect: value => `+${formatInt(value)}`
  },
  {
    id: 151,
    name: "You really didn't need it anyway",
    get description() {
      return `Get ${formatInt(800)} Antimatter Galaxies without
      buying 8th Antimatter Dimensions in your current Infinity.`;
    },
    checkRequirement: () => player.galaxies >= 800 && player.requirementChecks.infinity.noAD8,
    checkEvent: GAME_EVENT.GALAXY_RESET_AFTER,
    reward: "Unlock V, the Celestial of Achievements."
  },
  {
    // Implemented! Really hard to do, is probably buggy.
    id: 152,
    name: "Y'all got any more of them Glyphs?",
    get description() { return `Have ${formatInt(100)} Glyphs in your inventory.`; },
    checkRequirement: () => Glyphs.inventoryList.length >= 100,
    checkEvent: GAME_EVENT.GLYPHS_CHANGED,
    get reward() { return `+${formatInt(1)} Glyph to choose from on Reality, and gain a Glyph slot 
      that only accepts a particular kind of Glyph.`},
    effects: {
      glyphChoices: 5, // Assumes you already have the START perk that makes it 4 choices.
      glyphSlots: 1 // For the very special glyph slot.
    }
  },
  {
    // Implemented!
    id: 153,
    name: "More like \"reallydoesn'tmatter\"",
    description: "Reality without producing antimatter.",
    checkRequirement: () => player.requirementChecks.reality.noAM,
    checkEvent: GAME_EVENT.REALITY_RESET_BEFORE,
    get reward() { return `In non-celestial Realities, gain a multiplier to EP based on 
      how far away you are from obtaining ${formatPostBreak("1e4000")} EP.`},
    effect: () => DC.E4000.divide(Currency.eternityPoints.value).pow(0.04).clampMin(10),
    effectCondition: () => !isInCelestialReality(),
    formatEffect: value => isInCelestialReality() ? `Inactive` : `${formatX(value, 2, 2)}`
  },
  {
    id: 154,
    name: "I am speed",
    get description() { return `Reality in under ${formatInt(5)} seconds (game time).`; },
    checkRequirement: () => Time.thisReality.totalSeconds <= 5,
    checkEvent: GAME_EVENT.REALITY_RESET_BEFORE,
    get reward() { return `${formatPercents(0.1)} chance each Reality of ${formatX(2)} Realities and Perk Points.`; },
    effect: 0.1
  },
  {
    id: 155,
    name: "Achievement #15983",
    get description() { return `Play for ${formatFloat(13.7, 1)} billion years.`; },
    checkRequirement: () => Time.totalTimePlayed.totalYears > 13.7e9,
    checkEvent: GAME_EVENT.GAME_TICK_AFTER,
    get reward() { return `Black Hole durations are ${formatPercents(0.1)} longer, 
      and remove the ${formatInt(5)} second unpause penalty.`; },
    effect: 1.1
  },
  {
    id: 156,
    name: "College Dropout",
    description: "Reality without buying Time Theorems.",
    checkRequirement: () => player.requirementChecks.reality.noPurchasedTT,
    checkEvent: GAME_EVENT.REALITY_RESET_BEFORE,
    get reward() { return `Gain ${formatX(2.5, 0, 1)} generated Time Theorems, and a free coupon to McDonalds™️.`; },
    effect: 2.5
  },
  {
    // Implemented (in theory)!
    id: 157,
    name: "It's super effective!",
    get description() { return `Get a Glyph with ${formatInt(4)} effects.`; },
    checkRequirement: () => Glyphs.activeList.concat(Glyphs.inventoryList).map(
      glyph => getGlyphEffectsFromBitmask(glyph.effects, 0, 0)
        .filter(effect => effect.isGenerated).length
    ).max() >= 4,
    checkEvent: GAME_EVENT.GLYPHS_CHANGED,
    get reward() { return `Glyphs have a +${formatPercents(0.05)} chance to get an additional effect.`},
    // Assumes you already have the Reality upgrade that improves chances for additional effects.
    effect: 0.55,
  },
  {
    id: 158,
    name: "Bruh, are you like, inside the hole?",
    description: "Make both Black Holes permanent.",
    checkRequirement: () => BlackHole(1).isPermanent && BlackHole(2).isPermanent,
    checkEvent: GAME_EVENT.BLACK_HOLE_UPGRADE_BOUGHT,
    get reward() { return `Black Hole power increased by ${formatPercents(0.1)}.`; },
    effect: 1.1
  },

  {
    // Implemented!
    id: 161,
    name: "that's where you're wrong kiddo",
    get description() { return `Get ${formatPostBreak(DC.E1E8)} antimatter while Dilated.`; },
    checkRequirement: () => Currency.antimatter.exponent >= 100000000 && player.dilation.active,
    checkEvent: GAME_EVENT.GAME_TICK_AFTER,
    get reward() {
      return `Time Dilation effect is slightly weaker (${formatPow(1.01, 2, 2)} after reduction).`;
    },
    effect: 1.01,
  },
  {
    // Implemented!
    id: 162,
    name: "Reinstalled the game and rejoined the server",
    description: "Have every Time Study at once.",
    checkRequirement: () => player.timestudy.studies.length >= 58,
    checkEvent: GAME_EVENT.GAME_TICK_AFTER,
    reward: "Eternity Challenge 10 is no longer a requirement for any Time Studies."
  },
  {
    // Implemented!
    id: 163,
    name: "Actually, super easy! Barely an inconvenience!",
    get description() {
      return `Complete all the Eternity Challenges ${formatInt(5)} times with less than ${formatInt(1)}
      second (game time) in your current Reality.`;
    },
    checkRequirement: () => EternityChallenges.all.map(ec => ec.completions).min() >= 5 &&
      Time.thisReality.totalSeconds <= 1,
    checkEvent: GAME_EVENT.GAME_TICK_AFTER,
    get reward() {
      return `Raise EC2, EC4 and EC9's effect cap by ${formatPow(100)}.`;
    },
    effect: 100,
  },
  {
    id: 164,
    name: "Infinity times two",
    get description() { return `Get ${format(Decimal.NUMBER_MAX_VALUE, 1)} Infinities.`; },
    checkRequirement: () => Currency.infinitiesTotal.gte(Decimal.NUMBER_MAX_VALUE),
    checkEvent: GAME_EVENT.GAME_TICK_AFTER,
    get reward() { return `Gain ×${formatInt(1024)} more Infinities.`; },
    effect: 1024
  },
  {
    id: 165,
    name: "Perfectly balanced",
    get description() { return `Get a level ${formatInt(5000)} Glyph with all Glyph level factors equally weighted.`; },
    checkRequirement: () => gainedGlyphLevel().actualLevel >= 5000 &&
      ["repl", "dt", "eternities"].every(
        i => player.celestials.effarig.glyphWeights[i] === player.celestials.effarig.glyphWeights.ep),
    checkEvent: GAME_EVENT.REALITY_RESET_BEFORE,
    reward: "Unlock optimal automatic Glyph level factor adjustment."
  },
  {
    id: 166,
    name: "Nicenice.",
    get description() { return `Get a Glyph with level exactly ${formatInt(6969)}.`; },
    checkRequirement: () => gainedGlyphLevel().actualLevel === 6969,
    checkEvent: GAME_EVENT.REALITY_RESET_BEFORE,
    get reward() { return `+${formatInt(69)} to Glyph level.`; },
    effect: 69
  },
  {
    id: 167,
    name: "Mr. Layer? Sorry, you're not on the list",
    get description() { return `Reach ${format(Decimal.NUMBER_MAX_VALUE, 1, 0)} Reality Machines.`; },
    checkRequirement: () => Currency.realityMachines.gte(Decimal.NUMBER_MAX_VALUE),
    checkEvent: GAME_EVENT.GAME_TICK_AFTER,
    reward: "Gain more Reality Machines based on your current Reality Machines.",
    effect: () => Math.clampMin(1, Currency.realityMachines.value.log2()),
    formatEffect: value => `${formatX(value, 2, 2)}`
  },
  {
    // Buffed!
    id: 168,
    name: "Woah, we're halfway there",
    get description() { return `Get ${formatInt(50)} total Ra Celestial Memory levels.`; },
    checkRequirement: () => Ra.totalPetLevel >= 50,
    checkEvent: GAME_EVENT.GAME_TICK_AFTER,
    get reward() { return `Get ${formatPercents(0.15)} more memories.`; },
    effect: 1.15
  },

  {
    id: 171,
    name: "The god is delighted",
    description: "Sacrifice every sacrificable Glyph type at least once.",
    checkRequirement: () => Object.values(player.reality.glyphs.sac).every(s => s > 0),
    checkEvent: GAME_EVENT.GLYPHS_CHANGED,
    get reward() { return `Glyph sacrifice is ${formatX(2)} stronger.`; },
    effect: 2,
  },
  {
    // Last Achievement! To be implemented
    id: 172,
    name: "Hitchhiker's Guide to Reality",
    get description() {
      return `Reality for ${format(Decimal.NUMBER_MAX_VALUE, 1)} Reality Machines without having
      any Charged Infinity Upgrades or Enhanced Achievements, having any equipped Glyphs, 
      or buying any Triad Studies.`;
    },
    checkRequirement: () => MachineHandler.gainedRealityMachines.gte(Decimal.NUMBER_MAX_VALUE) &&
      player.celestials.ra.charged.size === 0 && player.reality.enhancedAchievements.size === 0 && 
      Glyphs.activeWithoutCompanion.length === 0 && player.requirementChecks.reality.noTriads,
    checkEvent: GAME_EVENT.REALITY_RESET_BEFORE,
    get reward() {
      return `${formatX(10000)} Infinities, +${formatInt(1)} Enhancement, +${formatInt(100)} to Glyph level
        and ${formatX(1000)} Time Theorems.`
    },
    effects: {
      infinityMultiplier: 10000,
      bonusEnhancements: 1,
      bonusGlyphLevels: 100,
      timeTheoremMultiplier: 1000
    },
  },
  {
    // Implemented!
    id: 173,
    name: "Cet accomplissement n'existe pas III",
    get description() { return `Reach ${formatPostBreak(DC.D9_99999E999, 5, 0)} Reality Machines.`; },
    checkRequirement: () => player.reality.realityMachines.gte(DC.D9_99999E999),
    checkEvent: GAME_EVENT.GAME_TICK_AFTER,
    get reward() { return `Make the Eternity Point formula better. 
      log(x)/${formatInt(308)} ➜ log(x)/${formatInt(300)}`; },
    effect: 8
  },
  {
    // Implemented!
    id: 174,
    name: "Don't you already have two of these?",
    description: "Get a Singularity.",
    checkRequirement: () => true,
    checkEvent: GAME_EVENT.SINGULARITY_RESET_BEFORE,
    reward: "Singularities boost Black Hole power.",
    effect: () => Math.pow(Currency.singularities.value + 1, 0.08),
    formatEffect: value => `${formatX(value, 2, 2)}`
  },
  {
    id: 175,
    name: "The First Antihistorian",
    get description() { return `Get ${formatInt(Ra.alchemyResourceCap)} of all Alchemy Resources.`; },
    checkRequirement: () => AlchemyResources.all.every(x => x.amount >= Ra.alchemyResourceCap),
    checkEvent: GAME_EVENT.REALITY_RESET_AFTER,
    get reward() {
      return `Synergism can go above ${formatPercents(1)} and Momentum increases ${formatX(10)} faster.`;
    },
    effect: 10,
  },
  {
    // Implemented!
    id: 176,
    name: "Mom counted to 3",
    description: "Annihilate your Dark Matter Dimensions.",
    reward: "Continuum now affects Dimension Boosts, with extra purchases having a reduced effect.",
    effect: () => Math.pow(Laitela.matterExtraPurchaseFactor, 0.1),
    formatEffect: value => `+${formatPercents(value - 1, 2, 2)}`
  },
  {
    // Implemented!
    id: 177,
    name: "This mile took a celestial",
    description: "Complete all Singularity Milestones at least once.",
    checkRequirement: () => SingularityMilestones.all.every(x => x.completions > 0),
    checkEvent: GAME_EVENT.SINGULARITY_RESET_AFTER,
    reward: "Continuum now affects Antimatter Galaxies, with extra purchases having a greatly reduced effect.",
    effect: () => Math.pow(Laitela.matterExtraPurchaseFactor, 0.05),
    formatEffect: value => `+${formatPercents(value - 1, 2, 2)}`
  },
  {
    id: 178,
    name: "Destroyer of Worlds",
    get description() { return `Get ${formatInt(108000)} Antimatter Galaxies.`; },
    checkRequirement: () => player.galaxies >= 108000,
    checkEvent: GAME_EVENT.GALAXY_RESET_AFTER,
    get reward() { return `All Galaxies are ${formatPercents(0.01)} stronger.`; },
    effect: 1.01
  },
        
  // ----------------------------------------------------------------------
  // Anything at this point forward won't start developing until later

  {
    id: 181,
    displayId: 666,
    name: "Antimatter Dimensions Eternal",
    description: "Doom your Reality.",
    checkRequirement: () => Pelle.isDoomed,
    checkEvent: GAME_EVENT.REALITY_RESET_AFTER,
  },
  {
    id: 182,
    name: "One more time",
    description: "Permanently gain back all Antimatter Dimension autobuyers.",
    checkRequirement: () => PelleUpgrade.antimatterDimAutobuyers1.canBeApplied &&
      PelleUpgrade.antimatterDimAutobuyers2.canBeApplied,
    checkEvent: GAME_EVENT.GAME_TICK_AFTER
  },
  {
    id: 183,
    name: "Déjà vOoM",
    description: "Complete Infinity Challenge 5 while Doomed.",
    checkRequirement: () => Pelle.isDoomed && InfinityChallenge(5).isCompleted,
    checkEvent: GAME_EVENT.INFINITY_CHALLENGE_COMPLETED,
    // Weirdly specific reward? Yes, its V's ST bonus because we forgot to disable it
    // when balancing Pelle and only realised too late.
    get reward() { return `All Antimatter Dimensions are raised to ${formatPow(1.0812403840463596, 0, 3)}`; },
    effect: 1.0812403840463596
  },
  {
    id: 184,
    name: "You're out!",
    description: "Encounter the third Pelle Strike.",
    checkRequirement: () => PelleStrikes.eternity.hasStrike,
    checkEvent: GAME_EVENT.PELLE_STRIKE_UNLOCKED
  },
  {
    id: 185,
    name: "Four score and seven years ago",
    description: "Encounter the fourth Pelle Strike.",
    checkRequirement: () => PelleStrikes.ECs.hasStrike,
    checkEvent: GAME_EVENT.PELLE_STRIKE_UNLOCKED
  },
  {
    id: 186,
    displayId: 181,
    name: "An unhealthy obsession",
    description: `Purchase Time Study 181 while Doomed.`,
    reward: "..."
  },
  {
    id: 187,
    name: "The One with Dilated Time",
    description: "Unlock Dilation while Doomed.",
    checkRequirement: () => PelleStrikes.dilation.hasStrike,
    checkEvent: GAME_EVENT.PELLE_STRIKE_UNLOCKED,
    // We forgot to disable a singularity milestone while balancing Pelle; now it's disabled
    // and this upgrade has the same effect as it used to.
    get reward() {
      return `Increase the multiplier per repeatable Dilated Time
      multiplier upgrade by ${formatX(1.35, 0, 2)}.`;
    },
    effect: 1.35
  },
  {
    id: 188,
    name: "The End",
    description: "Beat the game.",
    checkRequirement: () => GameEnd.endState > END_STATE_MARKERS.GAME_END && !GameEnd.removeAdditionalEnd,
    checkEvent: GAME_EVENT.GAME_TICK_AFTER
  },
];
