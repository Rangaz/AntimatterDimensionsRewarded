<script>
import PrimaryButton from "@/components/PrimaryButton";

export default {
  name: "ClassicDimensionBoostRow",
  components: {
    PrimaryButton
  },
  data() {
    return {
      requirement: {
        tier: 1,
        amount: 0
      },
      isBuyable: false,
      purchasedBoosts: 0,
      realBoosts: 0,
      imaginaryBoosts: 0,
      power: 2,
      lockText: null,
      isThisContinuum: false,
      unlockedByBoost: null,
      creditsClosed: false,
      requirementText: null,
      hasTutorial: false,
    };
  },
  computed: {
    isDoomed: () => Pelle.isDoomed,
    dimName() {
      return AntimatterDimension(this.requirement.tier).displayName;
    },
    boostCountText() {
      if (this.requirementText) return this.requirementText;
      const parts = [Math.floor(this.realBoosts)];
      if (this.imaginaryBoosts !== 0) {
        parts.push(this.imaginaryBoosts);
      }
      const sum = parts.map(formatInt).join(" + ");
      if (parts.length >= 2) {
        return `${sum} = ${formatInt(parts.sum())}`;
      }
      return sum;
    },
    continuumText() {
      if (!this.isThisContinuum) return;
      return `Continuum: ${formatFloat(this.realBoosts, 2)}`
    },
    classObject() {
      return {
        "o-primary-btn--dimboost l-dim-row__prestige-button": true,
        "tutorial--glow": this.isBuyable && this.hasTutorial,
        "o-non-clickable o-continuum": this.isThisContinuum,
        "o-pelle-disabled-pointer": this.creditsClosed
      };
    }
  },
  methods: {
    update() {
      const requirement = DimBoost.requirement;
      this.requirement.tier = requirement.tier;
      this.requirement.amount = requirement.amount;
      this.isBuyable = requirement.isSatisfied && DimBoost.canBeBought;
      this.isThisContinuum = Laitela.continuumActive && Achievement(176).isUnlocked;
      this.purchasedBoosts = DimBoost.purchasedBoosts;
      this.power = DimBoost.power;
      this.realBoosts = DimBoost.realBoosts;
      this.imaginaryBoosts = DimBoost.imaginaryBoosts;
      this.lockText = DimBoost.lockText;
      this.unlockedByBoost = DimBoost.unlockedByBoost;
      this.creditsClosed = GameEnd.creditsClosed;
      if (this.isDoomed) this.requirementText = formatInt(this.purchasedBoosts);
      this.hasTutorial = Tutorial.isActive(TUTORIAL_STATE.DIMBOOST);
    },
    dimensionBoost(bulk) {
      if (!DimBoost.requirement.isSatisfied || !DimBoost.canBeBought) return;
      manualRequestDimensionBoost(bulk);
    }
  }
};
</script>

<template>
  <div class="c-dimension-row c-antimatter-dim-row c-antimatter-prestige-row">
    <div class="l-dim-row__prestige-text c-dim-row__label c-dim-row__label--amount">
      Dimension Boost ({{ boostCountText }}):
      <span v-if="!isThisContinuum">requires {{ formatInt(requirement.amount) }} {{ dimName }} Dimensions</span>
      <span v-else>{{ formatX(power, 2, 2) }} to all Dimensions / Boost</span>
    </div>
    <PrimaryButton
      :enabled="isBuyable"
      :class="classObject"
      @click.exact="dimensionBoost(true)"
      @click.shift.exact="dimensionBoost(false)"
    >
      <span v-if="!isThisContinuum">{{ unlockedByBoost }}</span>
      <span v-else>{{ continuumText }}</span>
      <div
        v-if="hasTutorial"
        class="fas fa-circle-exclamation l-notification-icon"
      />
    </PrimaryButton>
  </div>
</template>

<style scoped>
.o-non-clickable {
  cursor: auto;
}

.o-continuum {
  border-color: var(--color-laitela--accent);
  color: var(--color-laitela--accent);
  background: var(--color-laitela--base);
  font-size: 12px !important;
}

.o-continuum:hover {
  border-color: var(--color-laitela--accent);
  color: var(--color-laitela--base);
  background: var(--color-laitela--accent);
}
.o-primary-btn--dimboost {
  width: 22rem;
  height: 5.5rem;
  position: relative;
  font-size: 0.9rem;
}
</style>
