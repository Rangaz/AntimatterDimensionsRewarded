import { GameMechanicState } from "../game-mechanics";
import { DC } from "../constants";
import { SteamRuntime } from "@/steam";

// I probably want this for my enhanced achievements
class EnhancedAchievementState extends GameMechanicState {
  constructor(config, achievement) {
    super(config);
    this._achievement = achievement;
  }

  get isEffectActive() {
    return this._achievement.isUnlocked && this._achievement.isEnhanced;
  }
}


class AchievementState extends GameMechanicState {
  constructor(config) {
    super(config);
    this._row = Math.floor(this.id / 10);
    this._column = this.id % 10;
    this._bitmask = 1 << (this.column - 1);
    this._inverseBitmask = ~this._bitmask;
    this.registerEvents(config.checkEvent, args => this.tryUnlock(args));
    if (config.enhanced) {
      this._enhancedEffect = new EnhancedAchievementState(config.enhanced, this);
    }
  }

  get name() {
    return this.config.name;
  }

  get row() {
    return this._row;
  }

  get column() {
    return this._column;
  }

  get isPreReality() {
    return this.row < 14;
  }

  get isPrePelle() {
    return this.row < 18;
  }

  get isUnlocked() {
    return (player.achievementBits[this.row - 1] & this._bitmask) !== 0;
  }

  get isDisabled() {
    return Pelle.isDisabled("achievements") && Pelle.disabledAchievements.includes(this.id);
  }

  get isEffectActive() {
    // This means that enhanced achievements lose their regular effect
    return this.isUnlocked && !this.isDisabled && !this.isEnhanced;
  }

  get hasEnhancedEffect() {
    return this.config.enhanced !== undefined;
  }

  get enhancedEffect() {
    return this._enhancedEffect;
  }

  get isEnhanced() {
    return player.reality.enhancedAchievements.has(this.id);
  }

  get canEnhance() {
    return this.isUnlocked &&
      this.hasEnhancedEffect &&
      !this.isEnhanced &&
      this.row <= Achievements.maxEnhancedRow && // Maximum row allowed
      Achievements.enhancementPoints !== 0 &&
      Perk.achievementEnhancement.isBought &&
      !Pelle.isDisabled("enhancedAchievements");
  }

  enhance() {
    if (!this.canEnhance) return;
    // Enhancing Achievement 81 affects post-infinity scaling
    if (this.id === 81) {
      GameCache.dimensionMultDecrease.invalidate();
    }
    if (this.id === 96) {
      player.eternityPoints = player.eternityPoints.plus(DC.E40.powEffectOf(Achievement(55).enhancedEffect));
    }
    player.reality.enhancedAchievements.add(this.id);
    //player.reality.enhancementPoints -= 1;
    EventHub.dispatch(GAME_EVENT.ACHIEVEMENT_ENHANCED);
  }

  // Should only be called when respeccing
  disEnhance() {
    player.reality.enhancedAchievements.delete(this.id);
  }


  tryUnlock(args) {
    if (this.isUnlocked) return;
    if (!this.config.checkRequirement(args)) return;
    this.unlock();
  }

  lock() {
    player.achievementBits[this.row - 1] &= this._inverseBitmask;
  }
  

  unlock(auto) {
    if (this.isUnlocked) return;
    player.achievementBits[this.row - 1] |= this._bitmask;

    // r85 multiplies IP gain by 4, and r93 by 6
    if (this.id === 85) {
      Autobuyer.bigCrunch.bumpAmount(4);
    }
    if (this.id === 93) {
      Autobuyer.bigCrunch.bumpAmount(6);
    }
    if (this.id === 55 && !PlayerProgress.realityUnlocked()) {
      Modal.message.show(`Since you performed an Infinity in under a minute, the UI changed on the screen.
        Instead of the Dimensions disappearing, they stay and the Big Crunch button appears on top of them.
        This is purely visual, and is there to prevent flickering.`, {}, 3);
    }
    // r63 gives 100 M IP
    if (this.id === 63) {
      player.infinityPoints = player.infinityPoints.plus(100000000);
    }
    // r81 affects post-infinity AD scaling
    if (this.id === 81) {
      GameCache.dimensionMultDecrease.invalidate();
    }
    // r96 gives 3 Eternity Points
    if (this.id === 96) {
      player.eternityPoints = player.eternityPoints.plus(3);
    }
    if (this.id === 148 || this.id === 166) {
      GameCache.staticGlyphWeights.invalidate();
    }
    // You must have Enhancement points equal to your row 14+ achievements.
    // But I'm no longer storing these in player. These variables are now
    // handled by Achievements, and it's much cleaner that way.
    //player.reality.totalEnhancementPoints = Achievements.all.countWhere(a => a.isUnlocked && !a.isPreReality);
    //if (!this.isPreReality) player.reality.enhancementPoints++;

    if (auto) {
      GameUI.notify.reality(`Automatically unlocked: ${this.name}`);
    } else {
      GameUI.notify.success(`Achievement: ${this.name}`);
      SteamRuntime.activateAchievement(this.id);
    }
    if (player.speedrun.isActive && !player.speedrun.achievementTimes[this.id]) {
      // This stores a lot of data in the savefile and seems particularly suceptible to floating-point rounding issues
      // for some reason, so we floor to get rid of fractions of milliseconds and reduce what filesize impact we can
      player.speedrun.achievementTimes[this.id] = Math.floor(player.records.realTimePlayed);
    }
    Achievements._power.invalidate();
    EventHub.dispatch(GAME_EVENT.ACHIEVEMENT_UNLOCKED);
  }
}

/**
 * @param {number} id
 * @returns {AchievementState}
 */
export const Achievement = AchievementState.createAccessor(GameDatabase.achievements.normal);

export const Achievements = {
  /**
   * @type {AchievementState[]}
   */
  all: Achievement.index.compact(),

  /**
   * @type {AchievementState[]}
   */
  get preReality() {
    return Achievements.all.filter(ach => ach.isPreReality);
  },

  /**
   * @type {AchievementState[]}
   */
  get prePelle() {
    return Achievements.all.filter(ach => ach.isPrePelle);
  },

  get allRows() {
    const count = Achievements.all.map(a => a.row).max();
    return Achievements.rows(1, count);
  },

  get preRealityRows() {
    const count = Achievements.preReality.map(a => a.row).max();
    return Achievements.rows(1, count);
  },

  get prePelleRows() {
    const count = Achievements.prePelle.map(a => a.row).max();
    return Achievements.rows(1, count);
  },

  rows: (start, count) => Array.range(start, count).map(Achievements.row),

  row: row => Array.range(row * 10 + 1, 8).map(Achievement),

  get effectiveCount() {
    const unlockedAchievements = Achievements.all.countWhere(a => a.isUnlocked);
    return unlockedAchievements;
  },

  get period() {
    return GameCache.achievementPeriod.value;
  },

  get totalEnhancementPoints() {
    return Achievements.all.countWhere(a => a.isUnlocked && !a.isPreReality) + V.spaceTheorems;
  },
  
  get enhancementPoints() {
    return this.totalEnhancementPoints - player.reality.enhancedAchievements.size;
  },

  get maxEnhancedRow() {
    return VUnlocks.maxEnhancedRow.effectOrDefault(4);
  },

  // Method used to read a preset
  // Presets will have the form "11, 12, 13, 21, 23, 27, 32, 87",
  // Achievement ids separated in commas, similar to how Time Study presets work.
  // We can afford to make the logic much simpler since we don't care about order.
  readPreset(text) {
    const enhancementArray = text.split(",");
    let achievementsToEnhance = [];
    for (const i of enhancementArray) {
      const achievement = Achievements.all.filter(a => a.id == Number.parseInt(i));
      achievementsToEnhance.push(achievement[0]);
    }
    return achievementsToEnhance;
  },

  enhanceFromArray(achievementsToEnhance) {
    for (const achievement of achievementsToEnhance) {
      achievement.enhance();
    }
  },

  enhanceFromPreset(text) {
    this.enhanceFromArray(this.readPreset(text));
    GameUI.notify.info("Attempted to load a preset");
  },

  // Return the current enhancements as a preset.
  // I use Array.from() to use its sort() function, as that returns a nicer string.
  // Otherwise it'll return the ids in purchase order, which looks messier.
  returnCurrrentEnhancementsAsPreset() {
    let enhancedAchievements = Array.from(player.reality.enhancedAchievements);
    enhancedAchievements.sort();
    let presetString = "";
    for (const id of enhancedAchievements) {
      presetString = presetString + id + ",";
    }
    // The string will end with a ",", so we'll remove the last character if there's anything at all
    if (presetString.length) {
      presetString = presetString.slice(0, -1);
    }
    return presetString;
  },

  truncateInput(input) {
    let internal = input.toLowerCase();
    return internal
      .replace(/[|,]$/u, "")
      .replaceAll(" ", "")
      // Allows 11,,21 to be parsed as 11,21
      .replace(/,{2,}/gu, ",")
  },

  // Instead of "11,12,13,14,15", it'll return "11, 12, 13, 14, 15"
  formatAchievementsList(input) {
    const internal = input.toLowerCase().replaceAll(" ", "");
    return internal.replaceAll(",", ", ");
  },

  disEnhanceAll() {
    const enhancedAchievements = Achievements.preReality;
    for (const achievement of enhancedAchievements) {
      achievement.disEnhance();
    }
    //player.reality.enhancementPoints = player.reality.totalEnhancementPoints;
    player.reality.disEnhance = false;
    EventHub.dispatch(GAME_EVENT.ACHIEVEMENTS_DISENHANCED);
  },

  autoAchieveUpdate(diff) {
    if (!PlayerProgress.realityUnlocked()) return;
    if (!player.reality.autoAchieve || RealityUpgrade(8).isLockingMechanics) {
      player.reality.achTimer = Math.clampMax(player.reality.achTimer + diff, this.period);
      return;
    }
    if (Achievements.preReality.every(a => a.isUnlocked)) return;

    player.reality.achTimer += diff;
    if (player.reality.achTimer < this.period) return;

    for (const achievement of Achievements.preReality.filter(a => !a.isUnlocked)) {
      achievement.unlock(true);
      player.reality.achTimer -= this.period;
      if (player.reality.achTimer < this.period) break;
    }
    player.reality.gainedAutoAchievements = true;
  },

  get timeToNextAutoAchieve() {
    if (!PlayerProgress.realityUnlocked()) return 0;
    if (GameCache.achievementPeriod.value === 0) return 0;
    if (Achievements.preReality.countWhere(a => !a.isUnlocked) === 0) return 0;
    return this.period - player.reality.achTimer;
  },

  _power: new Lazy(() => {
    const unlockedRows = Achievements.allRows
      .countWhere(row => row.every(ach => ach.isUnlocked));
    const basePower = Math.pow(1.25, unlockedRows) * Math.pow(1.03, Achievements.effectiveCount);
    const exponent = getAdjustedGlyphEffect("effarigachievement") * Ra.unlocks.achievementPower.effectOrDefault(1);
    return Math.pow(basePower, exponent);
  }),

  get power() {
    if (Pelle.isDisabled("achievementMult")) return 1;
    return Achievements._power.value;
  },

  updateSteamStatus() {
    for (const achievement of Achievements.all.filter(x => x.isUnlocked)) {
      SteamRuntime.activateAchievement(achievement.id);
    }
  }
};

EventHub.logic.on(GAME_EVENT.PERK_BOUGHT, () => {
  player.reality.achTimer = Math.clampMax(player.reality.achTimer, Achievements.period);
});
