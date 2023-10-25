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
    newEnhancements: {
      required: false, // Change this!!,
      validator: newEnhancements => Array.isArray(newEnhancements) || newEnhancements === undefined,
    },
    showPreview: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      maxEnhancedRow: 4,
      vAchievements: 0,
    };
  },
  computed: {
    layout() {
      return TimeStudyTreeLayout.create(this.layoutType, 0.15);
    },
    studies() {
      return this.layout.studies;
    },
    treeStyleObject() {
      return {
        width: `${this.layout.width}rem`,
        height: `${this.layout.height}rem`
      };
    },
    respecClassObject() {
      return {
        "o-primary-btn--subtab-option": true,
        "o-primary-btn--respec-active": this.respec
      };
    }
  },
  watch: {
    vAchievements() {
      // When vAchievements changes, we recompute the enhancement grid because of new rows
      this.$recompute("layout");
    }
  },
  methods: {
    update() {
      this.maxEnhancedRow = Achievements.maxEnhancedRow;
      this.vAchievements = V.spaceTheorems;
    },
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
    }
  }
};
</script>

<template>
  <div class="l-enhancements-preview__tree--wrapper">
    <div
      v-if="showPreview"
      class="l-enhancements-preview__tree"
      
    >
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
      v-else
      class="c-unavailable-warning"
    >
      Preview Unavailable
    </span>
  </div>
</template>

<style scoped>
.l-enhancements-preview__tree--wrapper {
  display: flex;
  overflow-y: auto;
  width: 20rem;
  height: 44.5rem;
  position: relative;
  justify-content: center;
  border: var(--color-text) solid var(--var-border-width, 0.3rem);
  border-radius: var(--var-border-radius, 0.3rem);
  margin: auto;
  padding: 0.5rem;
}

.c-unavailable-warning {
  align-self: center;
}
</style>
