<script>
import NormalAchievement from "./NormalAchievement";
import EffectDisplay from "@/components/EffectDisplay";

export default {
  name: "NormalAchievementRow",
  components: {
    NormalAchievement,
    EffectDisplay
  },
  props: {
    row: {
      type: Array,
      required: true
    },
    isObscured: {
      type: Boolean,
      required: false
    },
    canBeEnhanced: {
      type: Boolean,
      default: false
    },
    cursedRow: {
      type: Object,
      required: true
    },
    curseMode: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      isCompleted: false,
      isFullyEnhanced: false,
      isCursed: false,
      isHidden: false,
      isMouseOver: false,
    };
  },
  computed: {
    id() {
      return this.cursedRow.row;
    },
    config() {
      return this.cursedRow.config;
    },
    classObject() {
      return {
        "l-achievement-grid__row": true,
        "c-achievement-grid__row--completed": this.isCompleted && !this.isCursed,
        "c-achievement-grid__row--enhanced": this.isFullyEnhanced,
        "c-achievement-grid__row--cursed": this.isCursed,
      };
    }
  },
  methods: {
    update() {
      this.isCompleted = this.row.every(a => a.isUnlocked);
      this.isFullyEnhanced = this.row.every(a => a.isEnhanced);
      this.isCursed = this.cursedRow.isCursed;
      switch (player.options.hideAchievementRows) {
        case 0: {this.isHidden = false; break;}
        case 1: {this.isHidden = this.isCompleted && !this.canBeEnhanced; break;}
        case 2: this.isHidden = this.isCompleted;
      }
    },
    onMouseEnter() {
      clearTimeout(this.mouseOverInterval);
      this.isMouseOver = true;
    },
    onMouseLeave() {
      this.mouseOverInterval = setTimeout(() => this.isMouseOver = false, 300);
    },
    onCursedClick() {
      if (!this.curseMode) return;
      if (!this.cursedRow.toBeCursed && player.reality.respecAchievements) {
        player.celestials.ra.toBeCursedBits = 0;
        this.cursedRow.curseNextReality();
        player.reality.toBeEnhancedAchievements = new Set();
        player.reality.respecAchievements = false;
        return;
      }
      this.cursedRow.toBeCursed ? this.cursedRow.uncurseNextReality() :
      this.cursedRow.curseNextReality();
    }
  }
};
</script>

<template>
  <div
    v-if="!isHidden"
    class="l-achievement__row"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
    @click="onCursedClick"
  >
    <div class="o-achievement__tooltip__curse"
      v-if="config.curse && curseMode"
      ref="tooltip">
      <template v-if="isMouseOver">
        <div class="o-achievement__tooltip__name">
          Cursed row {{ id }}
        </div>
        <div
          class="o-achievement__tooltip__reward"
        >
          <span
            :class="{ 'o-cursed': isCursed }"
          >
            Curse: {{ config.curse }}
            <EffectDisplay
              v-if="config.formatEffect"
              br
              :config="config"
            />
          </span>
        </div>
      </template>
    </div>
    <div
      :class="classObject"
    >
      <normal-achievement
        v-for="(achievement, i) in row"
        :key="i"
        :achievement="achievement"
        :is-obscured="isObscured"
        :curse-mode="curseMode"
        class="l-achievement-grid__cell"
      />
    </div>
  </div>
</template>

<style scoped>
.l-achievement__row {
  position: relative;
}

.o-achievement__tooltip__curse {
  width: 20rem;
  position: absolute;
  bottom: 10.2rem;
  z-index: 11;
  font-size: 1.4rem;
  opacity: 0;
  color: var(--color-text);
  background: var(--color-base);
  border: 0.1rem solid rgb(238, 238, 238);
  border-radius: var(--var-border-radius, 0.8rem);
  margin-left: calc(50% - 10rem);
  padding: 0.4rem;
  transition-duration: 0.3s;
  pointer-events: none;
}

.t-normal .o-achievement__tooltip__curse,
.t-s12 .o-achievement__tooltip__curse {
  background: var(--color-base);
  border: 0.1rem solid #e2e2e2;
}

.o-achievement__tooltip__curse::after {
  content: " ";
  width: 0;
  position: absolute;
  bottom: 0;
  left: 50%;
  z-index: 11;
  border-top: 0 solid black;
  border-right: 0.7rem solid transparent;
  border-left: 0.7rem solid transparent;
  margin-bottom: 0;
  margin-left: -0.7rem;
  transition-duration: 0.3s;
}

.t-normal .o-achievement__tooltip__curse::after,
.t-s12 .o-achievement__tooltip__curse::after {
  border-top-color: #e2e2e2;
}


.l-achievement__row:hover .o-achievement__tooltip__curse {
  bottom: 12.1rem;
  opacity: 1;
}

.l-achievement__row:hover .o-achievement__tooltip__curse::after {
  border-top-width: 0.7rem;
  margin-bottom: -0.7rem;
}

.o-cursed {
  text-shadow: 0px 0px 2px #222222, 0px 0px 4px #e2e2e2;
}

.c-achievement-grid__row--enhanced {
  background-color: #587300;
  border-radius: var(--var-border-radius, 10px);
}

.s-base--metro .c-achievement-grid__row--enhanced {
  background-color: #3a5e1b;
}

.t-s1 .c-achievement-grid__row--enhanced {
  background-color: #bdc225;
}

.t-s7 .c-achievement-grid__row--enhanced {
  background-color: #a3ad73;
}

.c-achievement-grid__row--cursed {
  border-color: #e7e7e7;
  background-color: #222222;
  border-radius: var(--var-border-radius, 10px);
  border-style: double;
}

.s-base--metro .c-achievement-grid__row--cursed {
  background-color: #2d2d2d;
}
/*

.t-s1 .c-achievement-grid__row--cursed {
  background-color: #bdc225;
}

.t-s7 .c-achievement-grid__row--cursed {
  background-color: #a3ad73;
}
*/

</style>
