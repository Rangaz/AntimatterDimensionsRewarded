<script>
import ModalWrapperChoice from "@/components/modals/ModalWrapperChoice";
import { Achievement } from "../../core/globals";

export default {
  name: "SacrificeModal",
  components: {
    ModalWrapperChoice
  },
  data() {
    return {
      currentMultiplier: new Decimal(),
      nextMultiplier: new Decimal(),
      achievement38Value: new Decimal(),
      showAchievement38Warning: true,
    };
  },
  computed: {
    message() {
      if (Achievement(118).isUnlocked && !Pelle.isDoomed) {
        return `Dimensional Sacrifice will give you a boost to the 8th Antimatter Dimension based on the amount of
          1st Antimatter Dimensions you had at the time of Sacrificing.`;
      }
      return `Dimensional Sacrifice will remove all of your 1st through 7th Antimatter Dimensions
        (with the cost and multiplier unchanged), for a boost to the 8th Antimatter Dimension based on the total
        amount of 1st Antimatter Dimensions sacrificed. It will take time to regain production.`;
    },
    multiplierText() {
      return `Multiplier is currently ${formatX(this.currentMultiplier, 2, 2)} and will increase to
        ${formatX(this.nextMultiplier, 2, 2)} on Dimensional Sacrifice.`;
    },
    achievement38Text() {
      return `However, you will lose Achievement 38's ${formatX(this.achievement38Value, 2, 2)} multiplier, leaving 
      you with effectively a ${formatX(this.nextMultiplier.divide(this.achievement38Value), 2, 2)} multiplier.`
    }
  },
  methods: {
    update() {
      this.currentMultiplier.copyFrom(Sacrifice.totalBoost);
      this.nextMultiplier.copyFrom(Sacrifice.nextBoost.times(Sacrifice.totalBoost));
      Achievement(38).isEnhanced ? this.achievement38Value.copyFrom(Achievement(38).enhancedEffect.config.effect) : 
      this.achievement38Value.copyFrom(Achievement(38).config.effect);
      this.showAchievement38Warning = Achievement(38).canBeApplied || Achievement(38).enhancedEffect.canBeApplied;
    },
    handleYesClick() {
      sacrificeReset();
    }
  },
};
</script>

<template>
  <ModalWrapperChoice
    option="sacrifice"
    @confirm="handleYesClick"
  >
    <template #header>
      Dimensional Sacrifice
    </template>
    <div class="c-modal-message__text">
      {{ message }}
    </div>
    <br>
    <div class="c-modal-message__text">
      {{ multiplierText }}
      <br>
    </div>
    <br>
    <div class="c-modal-message__text"
    v-if=this.showAchievement38Warning>
      {{ achievement38Text }}
    </div>
  </ModalWrapperChoice>
</template>
