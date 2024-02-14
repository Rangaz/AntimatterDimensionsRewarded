import { GameMechanicState } from "../game-mechanics";
import { DC } from "../constants";
import { SteamRuntime } from "@/steam";

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

  // I want cursed to be different than disabled for now
  get isCursed() {
    if (CursedRow(this.row) == undefined) return false;
    return CursedRow(this.row).isCursed;
  }

  get isEffectActive() {
    // This means that enhanced achievements lose their regular effect
    return this.isUnlocked && !this.isDisabled && !this.isEnhanced && !this.isCursed;
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

  get isEnhancementLocked() {
    return player.reality.lockedEnhancements.has(this.id);
  }

  get toBeUnenhanced() {
    return this.isEnhanced && (!this.isEnhancementLocked || CursedRow(this.row).toBeCursed) &&
      (!player.reality.toBeEnhancedAchievements.has(this.id) ||
      player.reality.respecAchievements);
  }

  get canEnhance() {
    if (!Achievements.isEnhancementUnlocked || Pelle.isDisabled("enhancedAchievements") ||
      this.row > Achievements.maxEnhancedRow || !this.isUnlocked || 
      !this.hasEnhancedEffect || this.isEnhanced || this.isCursed) {
        return false;
    }

    // Handle special cases first
    // Free Enhancements should always be available
    if ([22, 61, 114, 126].includes(this.id)) return true;

    // Used for Imaginary Upgrade's locks 
    let effectiveEnhancementPoints = Achievements.enhancementPoints;
    if (ImaginaryUpgrade(19).isLockingMechanics) {
      // This should only leave 8 available
      effectiveEnhancementPoints -= Achievements.totalEnhancementPoints - 8;
    }
    if (ImaginaryUpgrade(25).isLockingMechanics) {
      // This should only leave 0 available
      effectiveEnhancementPoints -= Achievements.totalEnhancementPoints;
    }

    // Er47 doesn't work if Teresa isn't unlocked, so avoid Enhancing it
    if (this.id === 47 && !Teresa.isUnlocked) return false;

    // Er57 requires Er32 first, so if there aren't enough Enhancement points to Enhance
    // both this and r32, or if r32 is cursed, don't allow enhancing
    if (this.id === 57 && (Achievement(32).isCursed || 
      (!Achievement(32).isEnhanced && effectiveEnhancementPoints < 2))) {
      return false;
    }
    // Similar with Er88, that requires Er57 & Er32
    if (this.id === 88 && (Achievement(32).isCursed || Achievement(57).isCursed || 
      effectiveEnhancementPoints <= (!Achievement(32).isEnhanced + !Achievement(57).isEnhanced))) {
      return false;
    }

    if (this.id === 118 && effectiveEnhancementPoints < 2) return false;

    if (this.id === 133 && !V.isFullyCompleted) {
      return false;
    }

    // Similar with Er136 requiring Er115, but Er136 itself is free
    if (this.id === 136 && (Achievement(115).isCursed || 
    (!Achievement(115).isEnhanced && effectiveEnhancementPoints < 1))) {
      return false;
    }
    if (!this.isEnhanced && this.id === 136) return true;

    // Er138 requires 3 Enhancement points
    if (this.id === 138 && effectiveEnhancementPoints < 3) return false;

    return effectiveEnhancementPoints > 0;
  }

  // The fromPreset argument is so that we can avoid notifications about Achievements being auto-Enhanced
  // if we're using a preset. This is useful if, for example, 57 is written before 32.
  enhance(fromPreset = false) {
    if (!this.canEnhance) return;
    // Enhancing Achievement 57 requires Enhancing Achievement 32, so do that if neccesary.
    // The canEnhance() property already accounts for if this is possible beforehand.
    if (this.id === 57 && !Achievement(32).isEnhanced) {
      Achievement(32).enhance();
      if (!fromPreset) GameUI.notify.success("Achievement 32 has been automatically Enhanced");
    }
    // Similar logic with Er88
    if (this.id === 88 && (!Achievement(32).isEnhanced || !Achievement(57).isEnhanced)) {
      Achievement(32).enhance();
      Achievement(57).enhance();
      if (!fromPreset) GameUI.notify.success("Achievements 32 and 57 have been automatically Enhanced");
    }
    if (this.id === 136 && !Achievement(115).isEnhanced) {
      Achievement(115).enhance();
      if (!fromPreset) GameUI.notify.success("Achievement 115 has been automatically Enhanced");
    }

    // Enhancing Achievement 81 affects post-infinity scaling, and so does any row 1 Achievement. 
    if (this.id === 81 || (this.id > 10 && this.id < 20)) {
      GameCache.dimensionMultDecrease.invalidate();
    }
    if (this.id > 10 && this.id < 20) GameCache.row1Enhancements.invalidate();
    if (this.id === 96) {
      player.eternityPoints = player.eternityPoints.plus(DC.E40.powEffectOf(Achievement(55).enhancedEffect));
    }
    // Er136 makes Time Studies respecs instantaneous, so respec inmediately if it'd happen next eternity
    if (this.id === 136 && player.respec) {
      if (player.timestudy.studies.length === 0) {
        SecretAchievement(34).unlock();
      }
      respecTimeStudies(true);
      player.respec = false;
      if (!fromPreset) GameUI.notify.eternity("Your Time Studies have been respec");
    }
    player.reality.enhancedAchievements.add(this.id);
    // It is assumed that when you Enhance an Achievement you want to keep it
    player.reality.toBeEnhancedAchievements.add(this.id);

    if (player.requirementChecks.permanent.lastEnhancedAchievement == this.id) {
      player.requirementChecks.permanent.consecutiveEnhancements++;
    }
    else {
      player.requirementChecks.permanent.consecutiveEnhancements = 1;
      player.requirementChecks.permanent.lastEnhancedAchievement = this.id;
    }
    if (player.requirementChecks.permanent.consecutiveEnhancements >= 10) SecretAchievement(33).unlock();
    EventHub.dispatch(GAME_EVENT.ACHIEVEMENT_ENHANCED);
  }

  disEnhance(ignoreLock = false) {
    if (!ignoreLock && this.isEnhancementLocked) return;
    player.reality.enhancedAchievements.delete(this.id);
    player.reality.toBeEnhancedAchievements.delete(this.id);
    // Some Achievements are a requirement for other Enhancements.
    if (this.id === 32) {
      Achievement(88).disEnhance(true);
      Achievement(57).disEnhance(true);
    }
    if (this.id === 57) {
      Achievement(88).disEnhance(true);
    }
    if (this.id === 115) {
      Achievement(136).disEnhance(true);
    }
    
    if (player.requirementChecks.permanent.lastEnhancedAchievement == this.id) {
      player.requirementChecks.permanent.consecutiveEnhancements++;
    }
    else {
      player.requirementChecks.permanent.consecutiveEnhancements = 1;
      player.requirementChecks.permanent.lastEnhancedAchievement = this.id;
    }
    if (player.requirementChecks.permanent.consecutiveEnhancements >= 10) SecretAchievement(33).unlock();
    this.unlockEnhancement();
  }

  curse() {
    if (this.isEnhanced) this.disEnhance(true);
  }

  lockEnhancement() {
    if (!this.isEnhanced) return;
    if (this.id == 57) {
      Achievement(32).lockEnhancement();
    }
    if (this.id == 88) {
      Achievement(57).lockEnhancement();
    }
    if (this.id == 136) {
      Achievement(115).lockEnhancement();
    }
    player.reality.lockedEnhancements.add(this.id);
  }

  unlockEnhancement() {
    if (this.id == 32) {
      Achievement(57).unlockEnhancement();
    }
    if (this.id == 57) {
      Achievement(88).unlockEnhancement();
    }
    if (this.id == 115) {
      Achievement(136).unlockEnhancement();
    }
    if (this.isEnhancementLocked) player.reality.lockedEnhancements.delete(this.id);
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
    GameCache.totalEnhancementPoints.invalidate();
    EventHub.dispatch(GAME_EVENT.ACHIEVEMENT_UNLOCKED);
  }
}

class CursedRowState extends GameMechanicState {
  constructor(config) {
    super(config);
    this._row = this.id;
    this._bitmask = 1 << (this.row - 1);
    this._inverseBitmask = ~this._bitmask;
    //this.registerEvents(config.checkEvent, args => this.tryUnlock(args));
  }
  get row() {
    return this._row;
  }

  get isPreReality() {
    return this.row < 14;
  }
  
  get isPrePelle() {
    return this.row < 18;
  }
  
  get isCursed() {
    return (player.celestials.ra.cursedRowBits & this._bitmask) !== 0;
  }
  
  get toBeCursed() {
    return (player.celestials.ra.toBeCursedBits & this._bitmask) !== 0 && !player.reality.respecAchievements;
  }
  
  get isEffectActive() {
    return this.isCursed;
  }

  uncurse() {
    player.celestials.ra.cursedRowBits &= this._inverseBitmask;
    if (this.row === 2) GameCache.distantGalaxyStart.invalidate();
  }
  
  curse() {
    player.celestials.ra.cursedRowBits |= this._bitmask;
    for (let i = 1; i <= 8; i++) Achievement(10 * this.row + i).curse();
    // Cursing r81, and possibly Er11, changes post-infinity scaling
    if (this.row === 1 || this.row === 8) GameCache.dimensionMultDecrease.invalidate();
    if (this.row === 2) GameCache.distantGalaxyStart.invalidate();
  }

  uncurseNextReality() {
    player.celestials.ra.toBeCursedBits &= this._inverseBitmask;
  }

  curseNextReality() {
    player.celestials.ra.toBeCursedBits |= this._bitmask;
  }
}

/**
 * @param {number} id
 * @returns {CursedRowState}
*/
export const CursedRow = CursedRowState.createAccessor(GameDatabase.achievements.cursed);

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
   * @type {CursedRowState[]}
   */
  allCursedRows: CursedRow.index.compact(),

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

  get isEnhancementUnlocked() {
    return Perk.achievementEnhancement.isBought;
  },

  get effectiveCurses() {
    const activeCurses = Achievements.allCursedRows.countWhere(a => a.isCursed);
    return activeCurses;
  },

  get totalEnhancementPoints() {
    return GameCache.totalEnhancementPoints.value;
  },
  
  // Free Enhancements add 1 to compensate for the bigger size of enhancedAchievements
  get enhancementPoints() {
    return this.totalEnhancementPoints - player.reality.enhancedAchievements.size +
      Achievement(22).isEnhanced + Achievement(61).isEnhanced + Achievement(114).isEnhanced + 
      Achievement(126).isEnhanced + Achievement(136).isEnhanced - 
      Achievement(118).isEnhanced - 2 * Achievement(138).isEnhanced 
      + 2 * this.effectiveCurses;
  },

  get maxEnhancedRow() {
    return VUnlocks.maxEnhancedRow.effectOrDefault(4);
  },

  /** 
   * Method used to interpret "row X" and "aa-bb" into the achievement ids that correspond.
   * @param {String} input 
   * @returns {String}
  */
  parseInput(input) {
    const ROW_LIMIT = 20;
    const GROUP_LIMIT = 200;
    let parsedString = this.truncateInput(input);
    // If there's no text here, we'll return an empty string
    if (parsedString == undefined) return "";

    // Grouped rows refer to "row 1-4" or "rows 1-4" notation.
    // This is parsed first as "row 1, row 2, row 3, row 4", so later those rows get parsed.
    const groupedRowsToParse = Array.from(parsedString.matchAll(/rows?\d+-\d+/g));
    for (const groupedRow of groupedRowsToParse) {
      // The "s" in "rowS" must be accounted for to slice correctly
      const boundaries = groupedRow.toString().slice(3 + groupedRow.toString().includes("s")).split("-");
      const potentialRows = Array.range(Math.min(Number.parseInt(boundaries[0]), Number.parseInt(boundaries[1])), 
        Math.clampMax(Math.abs(Number.parseInt(boundaries[1]) - Number.parseInt(boundaries[0])) + 1, ROW_LIMIT));
      let parsedGroupedRows = "";
      potentialRows.forEach(value => {
        parsedGroupedRows += "row" + value + ",";
      })
      // parsedGroupedRows ends in a ",", we should remove it
      parsedString = parsedString.replace(groupedRow, parsedGroupedRows.slice(0, -1));
    }

    // Looks at strings containing "row" and some amount of digits.
    // Be careful here: It makes sense to write curses like '|row 1, row 2,(...)',
    // so rows will only be parsed if they are before the '|'.
    const rowsToParse = Array.from(parsedString.split("|")[0].matchAll(/row\d+/g));
    
    for (const row of rowsToParse) {
      const parsedRow = Array.range(0, 8).map(value => 
        {return Number.parseInt(row.toString().slice(3)) * 10 + value + 1}
      )
      // Because the replace() function only works on the first match, it shouldn't affect curses
      parsedString = parsedString.replace(row, parsedRow.toString());
    }

    // Looks at strings containing digits surrounding a "-"
    const groupsToParse = Array.from(parsedString.matchAll(/\d+-\d+/g));

    for (const group of groupsToParse) {
      const boundaries = group.toString().split("-").map(value => Number.parseInt(value));

      // We want to avoid unnecesarily expensive operations if by mistake you write 11-3437
      // We also want something like "66-61" to be valid
      const potentialIds = Array.range(Math.min(boundaries[0], boundaries[1]), 
        Math.clampMax(Math.abs(boundaries[1] - boundaries[0]) + 1, GROUP_LIMIT));
      let parsedGroup = [];
      for (const id of potentialIds) {
        if (Achievement(id) != undefined || CursedRow(id) != undefined) parsedGroup.push(id);
      }
      // If the group contains no Achievements, don't parse it so that it's displayed as an error
      if (parsedGroup.length == 0) continue;

      parsedString = parsedString.replace(group, parsedGroup.toString());
    }
    // Give a pipe at the end if there's none, so less issues arise
    if (!parsedString.includes("|")) parsedString += "|";

    return parsedString;
  },

  /** 
   * Makes the preset get rid of whitespaces so that it's easier to read in readPreset()
   * @param {String} input 
   * @returns {String}
  */
  truncateInput(input) {
    let internal = input.toLowerCase();
    return internal
      .trim()
      .replace(/[|,]$/u, "")
      .replaceAll(" ", "")
      // Allows 11,,21 to be parsed as 11,21
      .replace(/,{2,}/gu, ",")
      .replace(/,\|/gu, "|");
  },

  /** Instead of "11,12,13,14,15,row2", it'll return "11, 12, 13, 14, 15, row 2"
   * @param {String} input
   * @returns {String}
  */
  formatAchievementsList(input) {
    const internal = this.truncateInput(input);
    return internal.replaceAll(",", ", ").replaceAll("row", "row ").replaceAll("row s", "rows ")
      .replace("|", " | ");
  },

  /** 
   * Method used to read a preset
   * Presets will have the form "11, 12, 13, 21, 23, 27, 32, 87",
   * Achievement ids separated in commas, similar to how Time Study presets work.
   * The parseInput argument will also call parseInput() on the string if it hasn't been done before, true
   * by default.
   * This function will also return errors to inform the player.
   * @param {String} input 
   * @param {boolean} [parseInput=true]
   * @returns {Array}
   */
  readPreset(input, parseInput = true) {
    if (parseInput) input = this.parseInput(input);
    const enhancementArray = input.split("|")[0]?.split(",");
    const cursedArray = input.split("|")[1]?.split(",");
    let achievementsToEnhance = [];
    let cursesToApply = [];
    let invalidIds = [];
    let invalidCurses = [];
    if (enhancementArray != undefined) {
      for (const i of enhancementArray) {
        // An empty string should do nothing
        if (i == "") continue;
        // Errors won't stop the function, as we want to inform if there are errors
        if (isNaN(Number.parseInt(i))) {
          invalidIds.push(i);
          continue;
        }
        // Anything that isn't a whole number (for now) will be forbidden too
        if (Number.parseInt(i).toString() != i) {
          invalidIds.push(i);
          continue;
        }

        const achievement = Achievement(Number.parseInt(i));

        // This is if i is a number but does not correspond to an existing Achievement
        if (achievement == undefined) {
          invalidIds.push(i);
          continue;
        }

        // We'll also show as invalid Achievements that don't have 
        // an Enhancement effect or aren't unlocked
        if (!achievement.hasEnhancedEffect || achievement.row > Achievements.maxEnhancedRow) {
          invalidIds.push(i);
          continue;
        }

        achievementsToEnhance.push(achievement);
      }
    }
    if (cursedArray != undefined) {
      for (const i of cursedArray) {
        if (i == "") continue;
        const actualNumber = Number.parseInt(i.replace("row", ""));

        if (isNaN(actualNumber)) {
          invalidCurses.push(i);
          continue;
        }
        // Anything that isn't a whole number or a 'row' + whole number will be forbidden too
        if (actualNumber.toString() != i.replace("row","")) {
          invalidCurses.push(i);
          continue;
        }
        // We'll also show as invalid Curses that aren't unlocked
        if (actualNumber > Achievements.maxEnhancedRow) {
          invalidCurses.push(i);
          continue;
        }

        const curse = CursedRow(actualNumber);

        if (curse == undefined) {
          invalidCurses.push(i);
          continue;
        }

        cursesToApply.push(curse);
      }
    }
    return [achievementsToEnhance, invalidIds, cursesToApply, invalidCurses];
  },

  enhanceFromArray(achievementsToEnhance) {
    for (const achievement of achievementsToEnhance) {
      achievement.enhance(true);
    }
  },

  curseFromArray(cursesToApply) {
    for (const curse of cursesToApply) {
      curse.curseNextReality();
    }
  },

  applyEnhancementPreset(text) {
    const preset = this.readPreset(text);
    this.curseFromArray(preset[2]);
    this.enhanceFromArray(preset[0]);
  },

  // Return the current enhancements as a preset.
  // I use Array.from() to use its sort() function, as that returns a nicer string.
  // Otherwise it'll return the ids in purchase order, which looks messier.
  returnCurrentEnhancementsAsPreset() {
    let enhancedAchievements = Array.from(player.reality.enhancedAchievements);
    // This should arrange them correctly so that 101 does not come before 11
    enhancedAchievements.sort(function(a, b) {return a - b});
    let presetString = "";
    for (const id of enhancedAchievements) {
      presetString = presetString + id + ",";
    }
    // The string will end with a ",", so we'll remove the last character if there's anything at all
    if (presetString.length) {
      presetString = presetString.slice(0, -1);
    }
    // The separator between Achievements and Curses. We always include it to avoid issues
    presetString = presetString + "|";

    // If there's a curse...
    const cursedRowBits = player.celestials.ra.cursedRowBits;
    if (cursedRowBits) {
      

      for (let i = 0; i < 13; i++) {
        if ((cursedRowBits & (1 << i)) != 0) presetString = presetString + (i+1).toString() + ",";
      }
      presetString = presetString.slice(0, -1);
    }
    return presetString;
  },

  disEnhanceAll(ignoreLock = false) {
    const enhancedAchievements = Achievements.preReality.filter(ach => ach.isEnhanced);
    for (const achievement of enhancedAchievements) {
      achievement.disEnhance(ignoreLock);
    }
    player.reality.respecAchievements = false;
    
  },

  uncurseAll() {
    if (Achievements.effectiveCurses == 0) return;
    const cursedRows = Achievements.allCursedRows.filter(row => row.isCursed);
    for (const row of cursedRows) {
      row.uncurse();
      row.uncurseNextReality();
    }
    player.reality.respecAchievements = false;
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
