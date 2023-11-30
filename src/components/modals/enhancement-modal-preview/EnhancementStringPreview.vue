<script>

import { TimeStudyTreeLayout } from "@/components/tabs/time-studies/time-study-tree-layout";

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
    
    respecClassObject() {
      return {
        "o-primary-btn--subtab-option": true,
        "o-primary-btn--respec-active": this.respec
      };
    },
    
  },
  mounted() {
    const achievementsToEnhance = this.newEnhancements.split(",");
      for (const pseudoAchievement of this.$refs.id) {
        if (achievementsToEnhance.includes(pseudoAchievement.innerHTML)) {
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
      const achievementsToEnhance = newVal.split(",");
      for (const pseudoAchievement of this.$refs.id)
        if (achievementsToEnhance.includes(pseudoAchievement.innerHTML)) {
          pseudoAchievement.style["background-color"] = 'yellow';
          pseudoAchievement.style["color"] = 'black';
        }
        else {
          pseudoAchievement.style["background-color"] = '#40b050';
          pseudoAchievement.style["color"] = 'white';
        }
    }
  },
  methods: {
    update() {
      this.maxEnhancedRow = Achievements.maxEnhancedRow;
      this.vAchievements = V.spaceTheorems;
    },
    /*
    studyString(study) {
      switch (study.type) {
        case TIME_STUDY_TYPE.NORMAL: case TIME_STUDY_TYPE.TRIAD: return `${study.id}`;
        case TIME_STUDY_TYPE.ETERNITY_CHALLENGE: return `EC${study.id}`;
      }
      return "Dilation Study";
    },
    getStudyForceBoughtState(studyStr) {
      if (!this.disregardCurrentEnhancements) return ForceBoughtState.unspecified;
      return this.newEnhancements.includes(studyStr) ? ForceBoughtState.bought : ForceBoughtState.notBought;
    },
    getConnectionForceBoughtState(setup) {
      if (!this.disregardCurrentEnhancements) return ForceBoughtState.unspecified;
      return (this.newEnhancements.includes(this.studyString(setup.connection.to)) &&
        this.newEnhancements.includes(this.studyString(setup.connection.from)))
        ? ForceBoughtState.bought
        : ForceBoughtState.notBought;
    },
    */
  }
};
</script>

<template>
  <div class="l-enhancements-preview__table--wrapper">
    <!--I can't simpy use v-if="showPreview" here because that makes the later v-fors not work,
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
      <!--
      <PseudoTimeStudyButton
        v-for="setup in studies"
        :key="setup.study.type.toString() + setup.study.id.toString()"
        :setup="setup"
        :force-is-bought="getStudyForceBoughtState(studyString(setup.study))"
        :is-new-from-import="!disregardCurrentEnhancements && newEnhancements.includes(studyString(setup.study))"
      />
      -->
      
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
  height: 31.5rem;
  position: relative;
  justify-content: center;
  border: var(--color-text) solid var(--var-border-width, 0.3rem);
  border-radius: var(--var-border-radius, 0.3rem);
  margin: auto;
  padding: 0.5rem;
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
