<script>

// NONO This is not just StudyStringPreview.vue!

export const ForceBoughtState = {
  notBought: 0,
  unspecified: 1,
  bought: 2,

  getState(forceState, currentState) {
    switch (forceState) {
      case this.notBought:
        return false;
      case this.unspecified:
        return currentState;
      case this.bought:
        return true;
    }
    return currentState;
  }
};

export default {
  name: "EnhancementsTab",
  components: {
    //PseudoTimeStudyButton,
  },
  props: {
    disregardCurrentEnhancements: {
      type: Boolean,
      default: false
    },
    showPreview: {
      type: Boolean,
      default: true
    },
    newEnhancements: {
      type: String,
      required: true, 
    },
    includeBorder: {
      type: Boolean,
      default: true,
    }
  },
  data() {
    return {
      maxEnhancedRow: 4,
      vAchievements: 0,
    };
  },
  computed: {
    previewStyleObject() {
      return {
        display: this.showPreview ? "block" : "none"
      };
    },
    previewClassObject() {
      return {
        "l-enhancements-preview__table--wrapper": true,
        "c-enhancements-preview__table--wrapper": this.includeBorder,
      }
    },
    respecClassObject() {
      return {
        "o-primary-btn--subtab-option": true,
        "o-primary-btn--respec-active": this.respec
      };
    },
    
  },
  mounted() {
    const achievementsToEnhance = this.newEnhancements.split("|")[0]?.split(",");
    // rowsToCurse can be undefined at this stage for some reason, so I'll make it at least be ""
    const rowsToCurse = this.newEnhancements.split("|")[1]?.split(",") ?? "";
    for (const pseudoAchievement of this.$refs.id) {
      if (rowsToCurse.includes(pseudoAchievement.innerHTML.slice(0, -1))) {
        pseudoAchievement.style["background-color"] = 'white';
        pseudoAchievement.style["color"] = 'black';
      }
      else if (achievementsToEnhance.includes(pseudoAchievement.innerHTML)) {
        pseudoAchievement.style["background-color"] = 'yellow';
        pseudoAchievement.style["color"] = 'black';
      }
      else {
        pseudoAchievement.style["background-color"] = '#40b050';
        pseudoAchievement.style["color"] = 'white';
      }
    }
  },
  watch: {
    newEnhancements(newVal) {
      // Update Enhanced Achievements when the string changes
      const achievementsToEnhance = this.newEnhancements.split("|")[0].split(",");
      const rowsToCurse = this.newEnhancements.split("|")[1].split(",");
      for (const pseudoAchievement of this.$refs.id) {
        if (rowsToCurse.includes(pseudoAchievement.innerHTML.slice(0, -1))) {
          pseudoAchievement.style["background-color"] = 'white';
          pseudoAchievement.style["color"] = 'black';
        }
        else if (achievementsToEnhance.includes(pseudoAchievement.innerHTML)) {
          pseudoAchievement.style["background-color"] = 'yellow';
          pseudoAchievement.style["color"] = 'black';
        }
        else {
          pseudoAchievement.style["background-color"] = '#40b050';
          pseudoAchievement.style["color"] = 'white';
        }
      }
    }
  },
  methods: {
    update() {
      this.maxEnhancedRow = Achievements.maxEnhancedRow;
      this.vAchievements = V.spaceTheorems;
    },
  }
};
</script>

<template>
  <div :class="previewClassObject">
    <!--I can't simply use v-if="showPreview" here because that makes the later v-fors not work,
    and the Enhance Achievements function in the watcher triggered before the v-if, causing it to 
    not work properly. This method of putting display:"none" in previewStyleObject() apparently works.-->
    <div
      class="l-enhancements-preview__table"
      ref="preview"
      :style="previewStyleObject"
    >
      <table>
        <tr 
          v-for="row of Array.range(1, maxEnhancedRow)"
        >
          <td
            v-for="column of Array.range(row * 10 + 1, 8)"
            class="o-pseudo-achievement"
            ref="id"
          >{{ column }}</td>
        </tr>
      </table>
    </div>
    <span
      v-if="!showPreview"
      class="c-unavailable-warning"
    >
      Preview Unavailable
    </span>
  </div>
</template>

<style scoped>
.l-enhancements-preview__table--wrapper {
  display: flex;
  overflow-y: auto;
  width: 20rem;
  height: auto;
  position: relative;
  justify-content: center;
  margin: auto;
  padding: 0.5rem;
}
.c-enhancements-preview__table--wrapper {
  border: var(--color-text) solid var(--var-border-width, 0.3rem);
  border-radius: var(--var-border-radius, 0.3rem);
}
.o-pseudo-achievement {
  width: 2.3rem;
  height: 2.3rem;
  text-align: center;
  font-family: Typewriter, serif;
  font-size: 0.85rem;
  color: white;
  background-color: #40b050;
  border: 0.1rem solid;
  border-radius: var(--var-border-radius, 0.2rem);
  padding: 0;
  transition-duration: 0.2s;
  pointer-events: none;
}

.c-unavailable-warning {
  align-self: center;
}
</style>
