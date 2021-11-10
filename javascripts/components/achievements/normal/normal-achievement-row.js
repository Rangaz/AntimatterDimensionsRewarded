import "./normal-achievement.js";

Vue.component("normal-achievement-row", {
  props: {
    /** @type AchievementState[] */
    row: {
      type: Array,
      required: true
    },
  },
  data() {
    return {
      isCompleted: false,
      isHidden: false
    };
  },
  computed: {
    classObject() {
      return {
        "l-achievement-grid__row": true,
        "c-achievement-grid__row--completed": this.isCompleted
      };
    }
  },
  methods: {
    update() {
      this.isCompleted = this.row.every(a => a.isUnlocked);
      this.isHidden = this.isCompleted && player.options.hideCompletedAchievementRows;
    }
  },
  template: `
    <div v-if="!isHidden" :class="classObject">
      <normal-achievement
        v-for="(achievement, i) in row"
        :key="i"
        :achievement="achievement"
        class="l-achievement-grid__cell"
      />
    </div>`
});
