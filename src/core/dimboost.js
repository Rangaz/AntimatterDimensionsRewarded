import { DC } from "./constants";

class DimBoostRequirement {
  constructor(tier, amount) {
    this.tier = tier;
    this.amount = amount;
  }

  get isSatisfied() {
    const dimension = AntimatterDimension(this.tier);
    return dimension.totalAmount.gte(this.amount);
  }
}

export class DimBoost {
  static get power() {
    if (NormalChallenge(8).isRunning) {
      return DC.D1;
    }

    let boost = Effects.max(
      2,
      InfinityUpgrade.dimboostMult,
      InfinityChallenge(7).reward,
      InfinityChallenge(7),
      TimeStudy(81)
    )
      .toDecimal()
      .timesEffectsOf(
        TimeStudy(83),
        TimeStudy(231),
        Achievement(117),
        Achievement(117).enhancedEffect,
        Achievement(142),
        GlyphEffect.dimBoostPower,
        PelleRifts.recursion.milestones[0]
      ).powEffectsOf(InfinityUpgrade.dimboostMult.chargedEffect);
    if (GlyphAlteration.isAdded("effarig")) boost = boost.pow(getSecondaryGlyphEffect("effarigforgotten"));
    return boost;
  }

  static multiplierToNDTier(tier) {
    // Having cursed row 5 will make it useless against ADs 5-8
    if (CursedRow(5).isCursed && tier > 4) return DC.D1; 
    // r51 will make all Dimension Boosts affect all Antimatter dimensions
    const normalBoostMult = DimBoost.power.pow(this.realBoosts + 1 - tier * 
      (!Achievement(51).isUnlocked || Achievement(51).isCursed)).clampMin(1);
    const imaginaryBoostMult = DimBoost.power.times(ImaginaryUpgrade(24).effectOrDefault(1))
      .pow(this.imaginaryBoosts).clampMin(1);
    return normalBoostMult.times(imaginaryBoostMult);
  }

  static get maxDimensionsUnlockable() {
    return NormalChallenge(10).isRunning ? 6 : 8;
  }

  static get canUnlockNewDimension() {
    return DimBoost.purchasedBoosts + 4 < DimBoost.maxDimensionsUnlockable;
  }

  static get maxBoosts() {
    if (Ra.isRunning) {
      // Ra makes boosting impossible. Note that this function isn't called
      // when giving initial boosts, so the player will still get those.
      return 0;
    }
    if (InfinityChallenge(1).isRunning) {
      // Usually, in Challenge 8, the only boosts that are useful are the first 5
      // (the fifth unlocks sacrifice). In IC1 (Challenge 8 and Challenge 10
      // combined, among other things), only the first 2 are useful
      // (they unlock new dimensions).
      // There's no actual problem with bulk letting the player get
      // more boosts than this; it's just that boosts beyond this are pointless.
      return 2;
    }
    if (NormalChallenge(8).isRunning) {
      // See above. It's important we check for this after checking for IC1 since otherwise
      // this case would trigger when we're in IC1.
      return 5;
    }
    return Infinity;
  }

  static get canBeBought() {
    if (DimBoost.purchasedBoosts >= this.maxBoosts) return false;
    if (Laitela.continuumActive && Achievement(176).isUnlocked) return false;
    if (player.records.thisInfinity.maxAM.gt(Player.infinityGoal) &&
       (!player.break || Player.isInAntimatterChallenge)) return false;
    return true;
  }

  static get lockText() {
    if (DimBoost.purchasedBoosts >= this.maxBoosts) {
      if (Ra.isRunning) return "Locked (Ra's Reality)";
      if (InfinityChallenge(1).isRunning) return "Locked (Infinity Challenge 1)";
      if (NormalChallenge(8).isRunning) return "Locked (8th Antimatter Dimension Autobuyer Challenge)";
    }
    return null;
  }

  static get requirement() {
    return this.bulkRequirement(1);
  }

  static bulkRequirement(bulk) {
    const targetResets = DimBoost.purchasedBoosts + bulk;
    const tier = Math.min(targetResets + 3, this.maxDimensionsUnlockable);
    let amount = 20;
    const discount = Effects.sum(
      TimeStudy(211),
      TimeStudy(222)
    );
    if (tier === 6 && NormalChallenge(10).isRunning) {
      amount += Math.round((targetResets - 3) * (20 - discount));
    } else if (tier === 8) {
      amount += Math.round((targetResets - 5) * (15 - discount));
    }
    if (EternityChallenge(5).isRunning) {
      amount += Math.pow(targetResets - 1, 3) + targetResets - 1;
    }

    amount -= Effects.sum(InfinityUpgrade.resetBoost, Achievement(25));
    if (InfinityChallenge(5).isCompleted) amount -= 1;

    amount *= InfinityUpgrade.resetBoost.chargedEffect.effectOrDefault(1);

    // A minor hack to make continuum work for Dim Boosts
    if (!Laitela.continuumActive || !Achievement(176).isUnlocked) amount = Math.round(amount);

    return new DimBoostRequirement(tier, amount);
  }

  static get unlockedByBoost() {
    if (DimBoost.lockText !== null) return DimBoost.lockText;
    const boosts = DimBoost.purchasedBoosts;
    const allNDUnlocked = EternityMilestone.unlockAllND.isReached;

    let newUnlock = "";
    if (!allNDUnlocked && boosts < DimBoost.maxDimensionsUnlockable - 4) {
      newUnlock = `unlock the ${boosts + 5}th Dimension`;
    } else if (boosts === 4 && !NormalChallenge(10).isRunning && !EternityChallenge(3).isRunning) {
      newUnlock = "unlock Sacrifice";
    }

    const formattedMultText = `give a ${formatX(DimBoost.power, 2, 1)} multiplier `;
    let dimensionRange = `to the 1st Dimension`;
    if (boosts > 0) dimensionRange = `to Dimensions 1-${Math.min(boosts + 1, 8)}`;
    // r51 should update the text as well
    if (boosts >= DimBoost.maxDimensionsUnlockable - 1 || Achievement(51).canBeApplied) {
      dimensionRange = `to all Dimensions`;
    }
    // Cursed Row 5 should update it too
    if (CursedRow(5).isCursed) {
      dimensionRange = `to Dimensions 1-4`;
    }

    let boostEffects;
    if (NormalChallenge(8).isRunning) boostEffects = newUnlock;
    else if (newUnlock === "") boostEffects = `${formattedMultText} ${dimensionRange}`;
    else boostEffects = `${newUnlock} and ${formattedMultText} ${dimensionRange}`;

    if (boostEffects === "") return "Dimension Boosts are currently useless";
    const areDimensionsKept = (Perk.antimatterNoReset.isBought || Achievement(111).canBeApplied) &&
      (!Pelle.isDoomed || PelleUpgrade.dimBoostResetsNothing.isBought);
    if (areDimensionsKept) return boostEffects[0].toUpperCase() + boostEffects.substring(1);
    return `Reset your Dimensions to ${boostEffects}`;
  }

  static get purchasedBoosts() {
    return Math.floor(player.dimensionBoosts);
  }

  static get continuumBoosts() {
    if (!Laitela.continuumActive || !Achievement(176).isUnlocked) return 0;
    // This is a modification of maxBuyDimboosts()
    // If we still don't have all available dimensions, this is disabled
    if (DimBoost.canUnlockNewDimension) return 0;
    
    // Inverting bulkRequirement to improve performance, assuming EC5 is not active

    const increase = GameCache.increasePerDimBoost.value;
    const dim = AntimatterDimension(this.maxDimensionsUnlockable).continuumValue * 10;
    let maxBoosts = Math.min(Number.MAX_VALUE, 1 + (dim - 20) / increase);
    if (!EternityChallenge(5).isRunning) {
      player.dimensionBoosts = Math.floor(maxBoosts);
      return maxBoosts * Achievement(176).effectOrDefault(1);
    }
    // But in case of EC5 it's not, so do binary search for appropriate boost amount
    // ECs shouldn't matter once Continuum is unlocked, so I won't worry about this part.
    let minBoosts = 2;
    while (maxBoosts !== minBoosts + 1) {
      const middle = Math.floor((maxBoosts + minBoosts) / 2);
      if (DimBoost.bulkRequirement(middle).isSatisfied) minBoosts = middle;
      else maxBoosts = middle;
    }
    return (this.purchasedBoosts + minBoosts + 1 - (dim - 
      DimBoost.bulkRequirement(minBoosts).amount) / (DimBoost.bulkRequirement(minBoosts + 1).amount - 
      DimBoost.bulkRequirement(minBoosts).amount)) * Achievement(176).effectOrDefault(1);
  }

  static get realBoosts() {
    return Math.clampMax(Math.max(this.purchasedBoosts, this.continuumBoosts), this.maxBoosts);
  }

  static get imaginaryBoosts() {
    // Enhanced Achievements 25 & 111 give free imaginary boosts
    return Ra.isRunning ? 0 : (ImaginaryUpgrade(12).effectOrDefault(0) + Achievement(25).enhancedEffect.effectOrDefault(0) +
      Achievement(111).enhancedEffect.effectOrDefault(0)) * ImaginaryUpgrade(23).effectOrDefault(1);
  }

  static get totalBoosts() {
    return Math.floor(this.realBoosts + this.imaginaryBoosts);
  }

  static get startingDimensionBoosts() {
    if (InfinityUpgrade.skipResetGalaxy.isBought) return 4;
    if (InfinityUpgrade.skipReset3.isBought) return 3;
    if (InfinityUpgrade.skipReset2.isBought) return 2;
    if (InfinityUpgrade.skipReset1.isBought) return 1;
    return 0;
  }
}

// eslint-disable-next-line max-params
export function softReset(tempBulk, forcedADReset = false, forcedAMReset = false, enteringAntimatterChallenge = false,
  enteringC10OrIC1) {
  if (Currency.antimatter.gt(Player.infinityLimit)) return;
  const bulk = Math.min(tempBulk, DimBoost.maxBoosts - player.dimensionBoosts);
  EventHub.dispatch(GAME_EVENT.DIMBOOST_BEFORE, bulk);
  player.dimensionBoosts = Math.max(0, player.dimensionBoosts + bulk);
  resetChallengeStuff();
  player.records.timeSinceLastReset = 0;
  skipResetsIfPossible(enteringAntimatterChallenge);
  const canKeepDimensions = Pelle.isDoomed
    ? PelleUpgrade.dimBoostResetsNothing.canBeApplied
    : Perk.antimatterNoReset.canBeApplied;
  if (forcedADReset || !canKeepDimensions) {
    AntimatterDimensions.reset(enteringC10OrIC1);
    player.sacrificed = DC.D0;
    resetTickspeed();
  }
  const canKeepAntimatter = Pelle.isDoomed
    ? PelleUpgrade.dimBoostResetsNothing.canBeApplied
    : (Achievement(111).isUnlocked || Perk.antimatterNoReset.canBeApplied);
  if (!forcedAMReset && canKeepAntimatter) {
    Currency.antimatter.bumpTo(Currency.antimatter.startingValue);
  } else {
    Currency.antimatter.reset();
  }
  EventHub.dispatch(GAME_EVENT.DIMBOOST_AFTER, bulk);
}

export function skipResetsIfPossible(enteringAntimatterChallenge) {
  if (enteringAntimatterChallenge || Player.isInAntimatterChallenge) return;
 
  if (InfinityUpgrade.skipResetGalaxy.isBought && (player.dimensionBoosts < 4 || player.galaxies < 1)) {
    if (player.dimensionBoosts < 4) player.dimensionBoosts = 4;
    if (player.galaxies === 0) player.galaxies = 1;
  } else if (InfinityUpgrade.skipReset3.isBought && player.dimensionBoosts < 3) player.dimensionBoosts = 3;
  else if (InfinityUpgrade.skipReset2.isBought && player.dimensionBoosts < 2) player.dimensionBoosts = 2;
  else if (InfinityUpgrade.skipReset1.isBought && player.dimensionBoosts < 1) player.dimensionBoosts = 1;
}

export function manualRequestDimensionBoost(bulk) {
  if (Currency.antimatter.gt(Player.infinityLimit) || !DimBoost.requirement.isSatisfied) return;
  if (!DimBoost.canBeBought) return;
  if (Laitela.continuumActive && Achievement(176).isUnlocked) return;
  if (GameEnd.creditsEverClosed) return;
  if (player.options.confirmations.dimensionBoost) {
    Modal.dimensionBoost.show({ bulk });
    return;
  }
  requestDimensionBoost(bulk);
}

export function requestDimensionBoost(bulk) {
  if (Currency.antimatter.gt(Player.infinityLimit) || !DimBoost.requirement.isSatisfied) return;
  if (!DimBoost.canBeBought) return;
  if (Laitela.continuumActive && Achievement(176).isUnlocked) return;
  Tutorial.turnOffEffect(TUTORIAL_STATE.DIMBOOST);
  GameCache.distantGalaxyStart.invalidate();
  if (BreakInfinityUpgrade.autobuyMaxDimboosts.isBought && bulk) maxBuyDimBoosts();
  else softReset(1);
}

function maxBuyDimBoosts() {
  if (Laitela.continuumActive && Achievement(176).isUnlocked) return;
  // Boosts that unlock new dims are bought one at a time, unlocking the next dimension
  if (DimBoost.canUnlockNewDimension) {
    if (DimBoost.requirement.isSatisfied) softReset(1);
    return;
  }
  const req1 = DimBoost.bulkRequirement(1);
  if (!req1.isSatisfied) return;
  const req2 = DimBoost.bulkRequirement(2);
  if (!req2.isSatisfied) {
    softReset(1);
    return;
  }
  // Linearly extrapolate dimboost costs. req1 = a * 1 + b, req2 = a * 2 + b
  // so a = req2 - req1, b = req1 - a = 2 req1 - req2, num = (dims - b) / a
  const increase = req2.amount - req1.amount;
  const dim = AntimatterDimension(req1.tier);
  let maxBoosts = Math.min(Number.MAX_VALUE,
    1 + Math.floor((dim.totalAmount.toNumber() - req1.amount) / increase));
  if (DimBoost.bulkRequirement(maxBoosts).isSatisfied) {
    softReset(maxBoosts);
    return;
  }
  // But in case of EC5 it's not, so do binary search for appropriate boost amount
  let minBoosts = 2;
  while (maxBoosts !== minBoosts + 1) {
    const middle = Math.floor((maxBoosts + minBoosts) / 2);
    if (DimBoost.bulkRequirement(middle).isSatisfied) minBoosts = middle;
    else maxBoosts = middle;
  }
  softReset(minBoosts);
}
