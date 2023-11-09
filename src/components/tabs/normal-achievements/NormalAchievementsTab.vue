<script>
import NormalAchievementRow from "./NormalAchievementRow";
import PrimaryToggleButton from "@/components/PrimaryToggleButton";
import PrimaryButton from "@/components/PrimaryButton";
import EnhancementSaveLoadButton from "./EnhancementSaveLoadButton";
import SwapAchievementImagesButton from "./SwapAchievementImagesButton";

export default {
  name: "NormalAchievementsTab",
  components: {
    SwapAchievementImagesButton,
    NormalAchievementRow,
    EnhancementSaveLoadButton,
    PrimaryToggleButton,
    PrimaryButton
  },
  data() {
    return {
      achievementPower: 0,
      achDimEffect: new Decimal(0),
      achTPEffect: 0,
      achCountdown: 0,
      totalCountdown: 0,
      maxEnhancedRow: 0,
      totalEnhancementPoints: 0,
      enhancementPoints: 0,
      enhancedAchievements: 0,
      isCurseUnlocked: false,
      curseMode: false,
      missingAchievements: 0,
      showAutoAchieve: false,
      isAutoAchieveActive: false,
      isEnhancementUnlocked: false,
      respecEnhancements: false,
      showEnhancementPresets: false,
      hideRows: 0,
      enhancedAchMultToDims: false,
      achMultBreak: false,
      achMultToIDS: false,
      achMultToTDS: false,
      achMultToBH: false,
      achMultToTP: false,
      achMultToTT: false,
      renderedRowIndices: []
    };
  },
  computed: {
    isDoomed: () => Pelle.isDoomed,
    rows: () => Achievements.allRows,
    cursedRows: () => Achievements.allCursedRows,
    renderedRows() {
      return this.rows.filter((_, i) => this.renderedRowIndices.includes(i));
    },
    boostText() {
      const achievementPower = formatX(this.achievementPower, 2, 3);
      const achDimEffect = formatX(this.achDimEffect, 2, 3);
      const achTPEffect = formatX(this.achTPEffect, 2, 3);

      const boostList = [];

      const dimMultList = [];
      dimMultList.push("Antimatter");
      if (this.achMultToIDS) dimMultList.push("Infinity");
      if (this.achMultToTDS) dimMultList.push("Time");
      boostList.push(`${makeEnumeration(dimMultList)} Dimensions: ${achDimEffect}`);

      if (this.achMultToTP) boostList.push(`Tachyon Particles: ${achTPEffect}`);
      if (this.achMultToBH) boostList.push(`Black Hole Power: ${achievementPower}`);
      if (this.achMultToTT) boostList.push(`Time Theorem production: ${achievementPower}`);
      return `${boostList.join("<br>")}`;
    },
    saveLoadText() {
      return this.$viewModel.shiftDown ? "Save preset:" : "Load preset:";
    },
    hiddenRowsText() {
      switch (this.hideRows) {
        case 0: return "No";
        case 1: return this.isEnhancementUnlocked ? "Completed & can't be enhanced" : "Completed";
        case 2: return "Completed";
      }
    },
    respecClassObject() {
      return {
        "o-primary-btn--subtab-option": true,
        "o-primary-btn--enhanced-respec-active": this.respecEnhancements 
      };
    },
    curseModeClassObject() {
      return {
        "o-primary-btn--subtab-option": true,
        "o-primary-btn--curse-mode-inactive": !this.curseMode,
        "o-primary-btn--curse-mode-active": this.curseMode,
      }
    }
  },
  watch: {
    isAutoAchieveActive(newValue) {
      player.reality.autoAchieve = newValue;
    },
    respecEnhancements(newValue) {
      player.reality.disEnhance = newValue;
    },
    curseMode(newValue) {
      this.curseMode = newValue;
    }
  },
  created() {
    this.startRowRendering();
  },
  beforeDestroy() {
    cancelAnimationFrame(this.renderAnimationId);
  },
  methods: {
    update() {
      const gameSpeedupFactor = getGameSpeedupFactor();
      this.achievementPower = Achievements.power;
      this.enhancedAchMultToDims = Achievement(75).isEnhanced;
      this.achDimEffect = this.enhancedAchMultToDims ? Decimal.pow(this.achievementPower, 100) :
        this.achievementPower.toDecimal();
      this.achTPEffect = RealityUpgrade(8).config.effect();
      this.achCountdown = Achievements.timeToNextAutoAchieve / gameSpeedupFactor;
      this.totalCountdown = ((Achievements.preReality.countWhere(a => !a.isUnlocked) - 1) * Achievements.period +
        Achievements.timeToNextAutoAchieve) / gameSpeedupFactor;
      this.missingAchievements = Achievements.preReality.countWhere(a => !a.isUnlocked);
      this.enhancementPoints = Achievements.enhancementPoints;
      this.totalEnhancementPoints = Achievements.totalEnhancementPoints;
      this.respecEnhancements = player.reality.disEnhance;
      this.isEnhancementUnlocked = Achievements.isEnhancementUnlocked && !this.isDoomed;
      this.isCurseUnlocked = V.isFlipped;
      this.maxEnhancedRow = Achievements.maxEnhancedRow * this.isEnhancementUnlocked;
      this.showAutoAchieve = PlayerProgress.realityUnlocked() && !Perk.achievementGroup5.isBought;
      this.isAutoAchieveActive = player.reality.autoAchieve;
      this.hideRows = player.options.hideAchievementRows;
      this.showEnhancementPresets = VUnlocks.enhancementPresets.canBeApplied;
      this.achMultBreak = BreakInfinityUpgrade.achievementMult.canBeApplied;
      this.achMultToIDS = Achievement(75).canBeApplied || Achievement(75).isEnhanced;
      this.achMultToTDS = EternityUpgrade.tdMultAchs.isBought;
      this.achMultToTP = RealityUpgrade(8).isBought;
      this.achMultToBH = VUnlocks.achievementBH.canBeApplied;
      this.achMultToTT = Ra.unlocks.achievementTTMult.canBeApplied;
    },
    changeHiddenRows() {
      player.options.hideAchievementRows++;
      if (player.options.hideAchievementRows >= 3 - !this.isEnhancementUnlocked) player.options.hideAchievementRows = 0;
      this.startRowRendering();
    },
    startRowRendering() {
      const unlockedAndUnenhantableRows = []; // That can't be Enhanced
      const unlockedAndEnhantableRows = []; // That can be Enhanced
      const lockedRows = [];
      for (let i = 0; i < this.maxEnhancedRow; i++) {
        const targetArray = this.rows[i].every(a => a.isUnlocked) ? unlockedAndEnhantableRows : lockedRows;
        targetArray.push(i);
      }
      for (let i = this.maxEnhancedRow; i < this.rows.length; i++) {
        const targetArray = this.rows[i].every(a => a.isUnlocked) ? unlockedAndUnenhantableRows : lockedRows;
        targetArray.push(i);
      }
      const renderedLockedRows = lockedRows.filter(row => this.renderedRowIndices.includes(row));
      const nonRenderedLockedRows = lockedRows.filter(row => !this.renderedRowIndices.includes(row));
      let rowsToRender;
      switch (player.options.hideAchievementRows) {
        case 0: { // Hide nothing
          this.renderedRowIndices = renderedLockedRows;
          rowsToRender = unlockedAndEnhantableRows.concat(unlockedAndUnenhantableRows, nonRenderedLockedRows);
          break;
        }
        case 1: { // Hide completed & unenhantable rows
          this.renderedRowIndices = unlockedAndEnhantableRows.concat(unlockedAndUnenhantableRows, renderedLockedRows);
          rowsToRender = unlockedAndEnhantableRows.concat(nonRenderedLockedRows);
          break;
        }
        case 2: { // Hide all completed rows
          this.renderedRowIndices = unlockedAndEnhantableRows.concat(unlockedAndUnenhantableRows, renderedLockedRows);
          rowsToRender = nonRenderedLockedRows;
        }
      }

      const stepThroughRendering = () => {
        const ROWS_PER_FRAME = 2;
        for (let i = 0; i < ROWS_PER_FRAME; i++) {
          if (rowsToRender.length === 0) {
            return;
          }
          this.renderedRowIndices.push(rowsToRender.shift());
        }
        this.renderAnimationId = requestAnimationFrame(stepThroughRendering);
      };
      stepThroughRendering();
    },
    isRendered(row) {
      return this.renderedRowIndices.includes(row);
    },
    isObscured(row) {
      return this.isDoomed ? false : row === 17;
    },
    timeDisplay,
    timeDisplayNoDecimals,
  }
};
</script>

<template>
  <div class="l-achievements-tab">
    <div class="c-subtab-option-container">
      <button
        class="o-primary-btn o-primary-btn--subtab-option"
        @click="changeHiddenRows"
      >Hide rows: {{ hiddenRowsText }}
      </button>
      
      <PrimaryToggleButton
        v-if="showAutoAchieve"
        v-model="isAutoAchieveActive"
        class="o-primary-btn--subtab-option"
        label="Auto Achievements:"
      />
      
      <PrimaryButton
        v-if="isEnhancementUnlocked"
        :class="respecClassObject" 
        @click="respecEnhancements = !respecEnhancements"
      >Respec Enhanced Achievements on next Reality</PrimaryButton>

      <PrimaryButton
        v-if="isCurseUnlocked"
        :class="curseModeClassObject" 
        @click="curseMode = !curseMode"
      >Curse Achievements...</PrimaryButton>
    </div>
    <div class="c-enhancement-load-button-area"
      v-if="showEnhancementPresets && isEnhancementUnlocked && !curseMode"
    >
      <span 
        class="c-enhancement-save-load-text">{{ saveLoadText }}</span>
      <EnhancementSaveLoadButton
        v-for="saveslot in 6"
        :key="saveslot"
        :saveslot="saveslot"
      />
    </div>
    <div 
      v-if="!curseMode"
      class="c-achievements-tab__header c-achievements-tab__header--multipliers"
    >
      <span v-if="isDoomed">
        All Achievement multipliers have been disabled<SwapAchievementImagesButton />
      </span>
      <span v-else>
        Achievements provide a multiplier to<SwapAchievementImagesButton />
        <div v-html="boostText" />
      </span>
    </div>
    <div 
      v-if="isEnhancementUnlocked && !curseMode"
      class="c-achievements-tab__header"
      style="font-size:small"
    >
      Hold shift to see enhanced effects. 
      You have enhanced {{ formatInt(totalEnhancementPoints - enhancementPoints) }}/{{ formatInt(totalEnhancementPoints) }} Achievements.
    </div>
    <div 
      v-if="curseMode"
      class="c-achievements-tab__header"
      style="font-size:small;"
    >
      Curses work per row, disables its Achievements, and applies a nerf. <br>
      You can only curse rows you have unlocked Enhancements for. <br>
      Curses are applied at the beginning of the next Reality. <br>
      A cursed row counts as -1 Achievements Enhanced.
    </div>
    <div 
      v-if="isDoomed"
      class="c-achievements-tab__header"
    >
      You cannot enhance or curse Achievements while Doomed.
    </div>
    <div
      v-if="showAutoAchieve"
      class="c-achievements-tab__header"
    >
      <div v-if="achCountdown > 0">
        Automatically gain the next missing Achievement in
        {{ timeDisplayNoDecimals(achCountdown) }}<span v-if="!isAutoAchieveActive"> once Auto is turned on</span>.
        (left-to-right, top-to-bottom)
      </div>
      <div v-else-if="missingAchievements !== 0">
        Automatically gain the next missing Achievement as soon as you enable Auto Achievements.
        (left-to-right, top-to-bottom)
      </div>
      <div v-if="totalCountdown > 0">
        You will regain all remaining achievements after {{ timeDisplayNoDecimals(totalCountdown) }} if Auto
        Achievement <span v-if="isAutoAchieveActive">stays enabled</span><span v-else>is turned on</span>.
      </div>
      <br>
    </div>
    <div class="l-achievement-grid">
      <NormalAchievementRow
        v-for="(row, i) in renderedRows"
        :key="i"
        :row="row"
        :cursed-row="cursedRows[i]"
        :is-obscured="isObscured(i)"
        :can-be-enhanced="i + 1 <= maxEnhancedRow"
        :curse-mode="curseMode"
      />
    </div>
  </div>
</template>

<style scoped>
.c-enhancement-save-load-text {
  font-size: 14px;
  margin-top: 0.4rem;
}
.c-enhancement-load-button-area {
  display: flex;
  flex-flow: row wrap;
  justify-content: center;
}
.o-primary-btn--curse-mode-inactive {
  border-color: #e2e2e2;
}
.o-primary-btn--curse-mode-active {
  color: #222222;
  text-shadow: 0px 0px 4px #222222;
  background-color: #e2e2e2;
  box-shadow: 0px 0px 4px #e2e2e2;
  border-color: #000000;
}
.o-primary-btn--enhanced-respec-active {
  color: #ffffff;
  background-color: #aaaa33 !important;
}
.o-primary-btn--enhanced-respec-active:hover {
  color: #000000;
  background-color: #aaaa33 !important;
}
</style>