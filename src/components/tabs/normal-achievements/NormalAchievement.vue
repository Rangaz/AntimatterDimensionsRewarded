<script>
import wordShift from "@/core/word-shift";

import EffectDisplay from "@/components/EffectDisplay";
import HintText from "@/components/HintText";
import { GameUI, Pelle } from "../../../core/globals";

export default {
  name: "NormalAchievement",
  components: {
    EffectDisplay,
    HintText
  },
  props: {
    achievement: {
      type: Object,
      required: true
    },
    isObscured: {
      type: Boolean,
      required: false
    }
  },
  data() {
    return {
      isDisabled: false,
      isUnlocked: false,
      hasEnhancementEffect: false,
      canBeEnhanced: false,
      isEnhanced: false,
      isMouseOver: false,
      isCancer: false,
      showUnlockState: false,
      realityUnlocked: false,
      garbleTimer: 0,
      garbleKey: 0,
      achievementTime: 0,
    };
  },
  computed: {
    id() {
      return this.achievement.id;
    },
    displayId() {
      return this.config.displayId ?? this.id;
    },
    config() {
      return this.achievement.config;
    },
    shiftDown() {
      return ui.view.shiftDown;
    },
    styleObject() {
      return {
        "background-position": `-${(this.achievement.column - 1) * 104}px -${(this.achievement.row - 1) * 104}px`
      };
    },
    tooltipStyle() {
      return {
        "o-achievement__tooltip__can-be-enhanced": this.canBeEnhanced || 
          (this.shiftDown && this.hasEnhancementEffect),
        "o-achievement__tooltip": !this.canBeEnhanced,
        "l-column-one": this.achievement.column == 1,
        "l-column-two": this.achievement.column == 2 && this.canBeEnhanced,
        "l-column-seven": this.achievement.column == 7 && this.canBeEnhanced,
        "l-column-eight": this.achievement.column == 8,
      };
    },
    tooltipPosition() {
      switch (this.achievement.column) {
        case 1: return {"margin-left": "0rem"};
        case 2: return this.canBeEnhanced || (this.shiftDown && this.hasEnhancementEffect) ? 
          {"margin-left": "-11.4rem"} : null;
        case 7: return this.canBeEnhanced || (this.shiftDown && this.hasEnhancementEffect) ? 
          {"margin-left": "-18rem"} : null;
        case 8: return this.canBeEnhanced || (this.shiftDown && this.hasEnhancementEffect) ? 
          {"margin-left": "-29.4rem"} : {"margin-left": "-9.5rem"};
      };
    },
    classObject() {
      return {
        "o-achievement": true,
        "o-achievement--disabled": this.isDisabled,
        "o-achievement--locked": !this.isUnlocked && !this.isDisabled && !this.isObscured,
        "o-achievement--unlocked": this.isUnlocked,
        "o-achievement--enhanced": this.isEnhanced,
        "o-achievement--waiting": !this.isUnlocked && this.isPreRealityAchievement && !this.isDisabled,
        "o-achievement--blink": !this.isUnlocked && this.id === 78 && !this.isDisabled,
        "o-achievement--normal": !this.isCancer && !this.isObscured,
        "o-achievement--cancer": this.isCancer && !this.isObscured,
        "o-achievement--hidden": this.isObscured,
      };
    },
    indicatorIconClass() {
      if (this.isUnlocked) return "fas fa-check";
      if (this.isPreRealityAchievement && !this.isDisabled) return "far fa-clock";
      return "fas fa-times";
    },
    indicatorClassObject() {
      return {
        "o-achievement__indicator": true,
        "o-achievement__indicator--disabled": this.isDisabled,
        "o-achievement__indicator--locked": !this.isUnlocked && !this.isPreRealityAchievement && !this.isDisabled,
        "o-achievement__indicator--waiting": !this.isUnlocked && this.isPreRealityAchievement && !this.isDisabled,
      };
    },
    rewardClassObject() {
      return {
        "o-achievement__enhancement": true,
        "o-achievement__enhancement--enhanced": this.isEnhanced,
        "o-achievement__enhancement--disabled": this.isDisabled,
        "o-achievement__enhancement--locked": !this.isUnlocked && !this.isPreRealityAchievement && !this.isDisabled,
        // This last one shouldn't appear
        "o-achievement__enhancement--waiting": !this.isUnlocked && this.isPreRealityAchievement && !this.isDisabled,
      };
    },
    isPreRealityAchievement() {
      return this.realityUnlocked && this.achievement.row <= 13;
    },
    hasReward() {
      return this.config.reward !== undefined && !this.isObscured;
    },
    // The garble templates themselves can be static, and shouldn't be recreated every render tick
    garbledNameTemplate() {
      return this.makeGarbledTemplate(this.config.name);
    },
    garbledIDTemplate() {
      return this.makeGarbledTemplate(this.displayId);
    },
    garbledDescriptionTemplate() {
      return this.makeGarbledTemplate(this.config.description);
    },
    achievedTime() {
      if (!player.speedrun.isActive) return null;
      if (this.achievementTime === undefined) return "Not Achieved yet";
      return this.achievementTime === 0
        ? "Given at Speedrun start"
        : `Achieved after ${TimeSpan.fromMilliseconds(this.achievementTime).toStringShort()}`;
    }
  },
  beforeDestroy() {
    clearTimeout(this.mouseOverInterval);
  },
  methods: {
    update() {
      this.isDisabled = Pelle.disabledAchievements.includes(this.id) && Pelle.isDoomed;
      this.isUnlocked = this.achievement.isUnlocked && !this.isDisabled;
      this.hasEnhancementEffect = this.achievement.hasEnhancedEffect;
      this.isEnhanced = this.achievement.isEnhanced && !Pelle.isDoomed;
      this.canBeEnhanced = this.achievement.canEnhance && !Pelle.isDoomed;
      this.isCancer = Theme.current().name === "S4" || player.secretUnlocks.cancerAchievements;
      this.showUnlockState = player.options.showHintText.achievementUnlockStates;
      this.realityUnlocked = PlayerProgress.realityUnlocked();

      this.processedName = this.processText(this.config.name, this.garbledNameTemplate);
      this.processedId = this.processText(this.displayId, this.garbledIDTemplate);
      this.processedDescription = this.processText(this.config.description, this.garbledDescriptionTemplate);

      // This uses key-swapping to force the garbled achievements to re-render their text, because otherwise they
      // would remain static. Keys for non-garbled achievements won't change, and all keys remain unique.
      this.garbleTimer++;
      if (this.isObscured) {
        this.garbleKey = 10 * this.id + Math.floor(this.garbleTimer / 3);
      } else {
        this.garbleKey = this.id;
      }
      if (player.speedrun.isActive) this.achievementTime = player.speedrun.achievementTimes[this.id];
    },
    onMouseEnter() {
      clearTimeout(this.mouseOverInterval);
      this.isMouseOver = true;
    },
    onMouseLeave() {
      this.mouseOverInterval = setTimeout(() => this.isMouseOver = false, 300);
    },
    // We don't want to expose the original text for Pelle achievements, so we generate a random string with the same
    // length of the original text in order to make something that fits reasonably within their respective places
    makeGarbledTemplate(input) {
      // Input might be either text or number
      const text = `${input}`;
      let garbled = "";
      for (let i = 0; i < text.length; i++) {
        if (text[i] === " ") garbled += " ";
        else {
          const n = text[i].charCodeAt();
          // Essentially seeded randomness so that the static parts of the randomized text are deterministic
          garbled += String.fromCharCode(33 + ((n * n + i * i) % 93));
        }
      }
      return garbled;
    },
    // When appropriate, garbles input text for achievements on the last row. Otherwise leaves it unchanged
    processText(unmodified, garbledTemplate) {
      if (!this.isObscured) return unmodified;

      // The garbling effect often replaces spaces with non-spaces, which affects line length and can cause individual
      // lines to become long enough that they can't word-wrap. To address that, we take the template as a reference
      // and put spaces back into the same spots, ensuring that text can't overflow any worse than the original text
      const raw = wordShift.randomCrossWords(garbledTemplate);
      let modified = "";
      for (let i = 0; i < raw.length; i++) {
        if (garbledTemplate[i] === " ") modified += " ";
        else modified += raw[i];
      }
      return modified;
    }
  }
};
</script>

<template>
  <div
    :class="classObject"
    :style="styleObject"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
    @click="achievement.enhance()"
  >
    <HintText
      :key="garbleKey"
      type="achievements"
      class="l-hint-text--achievement"
    >
      {{ processedId }}
    </HintText>
    <div :class="tooltipStyle"
    :style="tooltipPosition"
    ref="tooltip">
      <template v-if="isMouseOver">
        <div class="o-achievement__tooltip__name">
          {{ processedName }} ({{ processedId }})
        </div>
        <div class="o-achievement__tooltip__description">
          {{ processedDescription }}
        </div>
        <table class="o-achievement__tooltip__table">
          <div
            v-if="config.reward && (!isEnhanced || shiftDown)"
            class="o-achievement__tooltip__reward"
          >
            <span
              v-if="!isObscured"
              :class="{ 'o-pelle-disabled': isDisabled }"
            >
              Reward: {{ config.reward }}
              <EffectDisplay
                v-if="config.formatEffect"
                br
                :config="config"
              />
            </span>
          </div>
          <td v-if="(shiftDown && hasEnhancementEffect) || canBeEnhanced" style="vertical-align: middle;">➜</td>
          <!--My Enhanced effect-->
          <div
            v-if="(shiftDown && hasEnhancementEffect) || canBeEnhanced || isEnhanced"
            class="o-achievement__tooltip__enhanced"
          >
            <span
              v-if="!isObscured"
              :class="{ 'o-pelle-disabled': isDisabled }"
            >
              Enhanced: {{ config.enhanced.reward }}
              <EffectDisplay
                v-if="config.enhanced.formatEffect"
                br
                :config="config.enhanced"
              />
            </span>
          </div>
        </table>
        <div
          v-if="achievedTime"
          class="o-achievement-time"
        >
          {{ achievedTime }}
        </div>
      </template>
    </div>
    <div
      v-if="showUnlockState"
      :class="indicatorClassObject"
    >
      <i :class="indicatorIconClass" />
    </div>
    <!--Now the Enhanced icon-->
    <div
      v-if="canBeEnhanced"
      :class="rewardClassObject"
    >
      <i class="fas fa-arrow-up" />
    </div>
    <div
      v-if="isEnhanced"
      :class="rewardClassObject"
    >
      <i class="fas fa-trophy" />
    </div>
  </div>
</template>

<style scoped>
.o-achievement-time {
  font-weight: bold;
  color: var(--color-accent);
}

.o-achievement--disabled {
  background-color: var(--color-pelle--base);
  border-color: var(--color-bad);
}

.o-achievement--locked {
  background-color: #a3a3a3;
  border-color: var(--color-bad);
}

.t-dark-metro .o-achievement--locked {
  background-color: #9e9e9e;
}

.t-metro .o-achievement--locked,
.t-inverted-metro .o-achievement--locked,
.t-s8 .o-achievement--locked {
  background-color: #9e9e9e;
  border-color: var(--color-bad);
}

.t-s2 .o-achievement--locked {
  background-color: rgba(0, 0, 0, 0%);
}

.t-s5 .o-achievement--locked {
  background-color: #222222;
  border-color: #000000;
}

.t-s7 .o-achievement--locked {
  background-color: #555555;
  border-color: #111111;
}

.o-achievement--waiting {
  background-color: #d1d161;
  border-color: #acac39;
}

.o-achievement--enhanced {
  box-shadow: 0px 0px 20px #acac39;
  background-color: #aacc75;
}

.t-dark-metro .o-achievement--waiting {
  background-color: #b9b946;
  border-color: #7d7d36;
}

.t-metro .o-achievement--waiting,
.t-inverted-metro .o-achievement--waiting,
.t-s8 .o-achievement--waiting {
  background-color: #ffee58;
  border-color: #757575;
}

.o-achievement--blink {
  animation: a-achievement--blink 2s step-start 0s infinite;
}

@keyframes a-achievement--blink {
  50% {
    visibility: hidden;
  }
}
.o-achievement__tooltip__can-be-enhanced {
  width: 40rem;
  position: absolute;
  bottom: 10.2rem;
  z-index: 2;
  font-size: 1.4rem;
  opacity: 0;
  color: var(--color-text);
  background: var(--color-base);
  border: 0.1rem solid rgb(0, 0, 0);
  border-radius: var(--var-border-radius, 0.8rem);
  margin-left: -15rem;
  padding: 0.4rem;
  transition-duration: 0.3s;
  pointer-events: none;
}
.o-achievement__tooltip__can-be-enhanced::after {
  content: " ";
  width: 0;
  position: absolute;
  bottom: 0;
  right: 50%;
  z-index: 0;
  border-top: 0 solid black;
  border-right: 0.7rem solid transparent;
  border-left: 0.7rem solid transparent;
  margin-bottom: 0;
  margin-left: -0.7rem;
  transition-duration: 0.3s;
}
.t-normal .o-achievement__tooltip__can-be-enhanced,
.t-s12 .o-achievement__tooltip__can-be-enhanced {
  background: var(--color-base);
  border: 0.1rem solid var(--color-accent);
}

.t-normal .o-achievement__tooltip__can-be-enhanced::after,
.t-s12 .o-achievement__tooltip__can-be-enhanced::after {
  border-top-color: var(--color-accent);
}
.o-achievement:hover .o-achievement__tooltip__can-be-enhanced {
  bottom: 11rem;
  opacity: 1;
}

.o-achievement:hover .o-achievement__tooltip__can-be-enhanced::after {
  border-top-width: 0.7rem;
  margin-bottom: -0.7rem;
}
/*The column styles here only have the purpose of aligning a specific element*/
.l-column-one::after {
  left: 5rem;
}
.l-column-two::after {
  left: 17rem;
}
.l-column-seven::after {
  left: 23rem;
}.l-column-eight::after {
  right: 5rem;
}

.o-achievement__enhancement {
  width: 1.5rem;
  height: 1.5rem;
  position: absolute;
  left: 0;
  bottom: 0;
  font-size: 1rem;
  color: #2d2d02;
  background: #aac437;
  border-top: var(--var-border-width, 0.2rem) solid #97ad16;
  border-right: var(--var-border-width, 0.2rem) solid #97ad16;
  border-top-right-radius: var(--var-border-radius, 0.8rem);
  border-bottom-left-radius: var(--var-border-radius, 0.6rem);
}

.o-achievement__enhancement--locked {
  background: #a3a3a3;
  border-color: var(--color-bad);
}

.o-achievement__enhancement--waiting {
  background: #d1d161;
  border-color: #acac39;
}

.o-achievement__enhancement--disabled {
  background: var(--color-pelle--base);
  border-color: var(--color-bad);
}

.o-achievement__enhancement--enhanced {
  box-shadow: 0px 0px 5px #acac39;
}

.o-achievement__tooltip__enhanced {
  font-style: italic;
  font-size: 1.3rem;
  text-shadow: 0px 0px 4px #aac437;
}
</style>
