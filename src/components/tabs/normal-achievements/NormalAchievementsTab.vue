<script>
import NormalAchievementRow from "./NormalAchievementRow";
import PrimaryToggleButton from "@/components/PrimaryToggleButton";
import PrimaryButton from "@/components/PrimaryButton";
import EnhancementSaveLoadButton from "./EnhancementSaveLoadButton";
import SwapAchievementImagesButton from "./SwapAchievementImagesButton";
import { Pelle } from "../../../core/globals";

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
      totalEnhancementPoints: 0,
      enhancementPoints: 0,
      enhancedAchievements: 0,
      missingAchievements: 0,
      showAutoAchieve: false,
      isAutoAchieveActive: false,
      isEnhancementUnlocked: false,
      respecEnhancements: false,
      showEnhancementPresets: false,
      hideCompletedRows: false,
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
    respecClassObject() {
      return {
        "o-primary-btn--subtab-option": true,
        "o-primary-btn--enhanced-respec-active": this.respecEnhancements 
      };
    },
  },
  watch: {
    isAutoAchieveActive(newValue) {
      player.reality.autoAchieve = newValue;
    },
    hideCompletedRows(newValue) {
      player.options.hideCompletedAchievementRows = newValue;
      this.startRowRendering();
    },
    respecEnhancements(newValue) {
      player.reality.disEnhance = newValue;
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
      this.enhancedAchievements = player.reality.enhancedAchievements.size;
      this.respecEnhancements = player.reality.disEnhance;
      this.isEnhancementUnlocked = Perk.achievementEnhancement.isBought && !this.isDoomed;
      this.showAutoAchieve = PlayerProgress.realityUnlocked() && !Perk.achievementGroup5.isBought;
      this.isAutoAchieveActive = player.reality.autoAchieve;
      this.hideCompletedRows = player.options.hideCompletedAchievementRows;
      this.showEnhancementPresets = VUnlocks.enhancementPresets.canBeApplied;
      this.achMultBreak = BreakInfinityUpgrade.achievementMult.canBeApplied;
      this.achMultToIDS = Achievement(75).isUnlocked;
      this.achMultToTDS = EternityUpgrade.tdMultAchs.isBought;
      this.achMultToTP = RealityUpgrade(8).isBought;
      this.achMultToBH = VUnlocks.achievementBH.canBeApplied;
      this.achMultToTT = Ra.unlocks.achievementTTMult.canBeApplied;
    },
    startRowRendering() {
      const unlockedRows = [];
      const lockedRows = [];
      for (let i = 0; i < this.rows.length; i++) {
        const targetArray = this.rows[i].every(a => a.isUnlocked) ? unlockedRows : lockedRows;
        targetArray.push(i);
      }
      const renderedLockedRows = lockedRows.filter(row => this.renderedRowIndices.includes(row));
      const nonRenderedLockedRows = lockedRows.filter(row => !this.renderedRowIndices.includes(row));
      let rowsToRender;
      if (player.options.hideCompletedAchievementRows) {
        this.renderedRowIndices = unlockedRows.concat(renderedLockedRows);
        rowsToRender = nonRenderedLockedRows;
      } else {
        this.renderedRowIndices = renderedLockedRows;
        rowsToRender = unlockedRows.concat(nonRenderedLockedRows);
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
      <PrimaryToggleButton
        v-model="hideCompletedRows"
        class="o-primary-btn--subtab-option"
        label="Hide completed rows:"
      />
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
    </div>
    <div class="c-enhancement-load-button-area"
      v-if="showEnhancementPresets && isEnhancementUnlocked"
    >
      <span 
        class="c-enhancement-save-load-text">{{ saveLoadText }}</span>
      <EnhancementSaveLoadButton
        v-for="saveslot in 6"
        :key="saveslot"
        :saveslot="saveslot"
            />
    </div>
    <div class="c-achievements-tab__header c-achievements-tab__header--multipliers">
      <span v-if="isDoomed">
        All Achievement multipliers have been disabled<SwapAchievementImagesButton />
      </span>
      <span v-else>
        Achievements provide a multiplier to<SwapAchievementImagesButton />
        <div v-html="boostText" />
      </span>
    </div>
    <div 
      v-if="isEnhancementUnlocked"
      class="c-achievements-tab__header"
      style="font-size:small"
    >
      Hold shift to see enhanced effects. 
      You have enhanced {{ formatInt(enhancedAchievements) }}/{{ formatInt(totalEnhancementPoints) }} Achievements.
    </div>
    <div 
      v-if="isDoomed"
      class="c-achievements-tab__header"
    >
      You cannot enhance Achievements while Doomed.
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
        :is-obscured="isObscured(i)"
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
.o-primary-btn--enhanced-respec-active {
  color: #ffffff;
  background-color: #aaaa33 !important;
}
.o-primary-btn--enhanced-respec-active:hover {
  color: #000000;
  background-color: #aaaa33 !important;
}
</style>