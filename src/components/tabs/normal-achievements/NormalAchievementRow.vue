<script>
import NormalAchievement from "./NormalAchievement";

export default {
  name: "NormalAchievementRow",
  components: {
    NormalAchievement
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
    }
  },
  data() {
    return {
      isCompleted: false,
      isFullyEnhanced: false,
      isHidden: false
    };
  },
  computed: {
    classObject() {
      return {
        "l-achievement-grid__row": true,
        "c-achievement-grid__row--completed": this.isCompleted,
        "c-achievement-grid__row--enhanced": this.isFullyEnhanced
      };
    }
  },
  methods: {
    update() {
      this.isCompleted = this.row.every(a => a.isUnlocked);
      this.isFullyEnhanced = this.row.every(a => a.isEnhanced);
      switch (player.options.hideAchievementRows) {
        case 0: {this.isHidden = false; break;}
        case 1: {this.isHidden = this.isCompleted && !this.canBeEnhanced; break;}
        case 2: this.isHidden = this.isCompleted;
      }
      //this.isHidden = this.isCompleted && player.options.hideCompletedAchievementRows;
    }
  }
};
</script>

<template>
  <div
    v-if="!isHidden"
    :class="classObject"
  >
    <normal-achievement
      v-for="(achievement, i) in row"
      :key="i"
      :achievement="achievement"
      :is-obscured="isObscured"
      class="l-achievement-grid__cell"
    />
  </div>
</template>

<style scoped>
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

</style>
