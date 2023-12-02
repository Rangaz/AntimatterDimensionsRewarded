<script>
import { Achievements } from "../../../core/globals";
import HoverMenu from "./HoverMenu";

// Yes, I literally copy-pasted "TimeStudySaveLoadButton.vue" to make my own 
// presets for Achievement Enhancement
export default {
  name: "EnhancementSaveLoadButton",
  components: {
    HoverMenu,
  },
  props: {
    saveslot: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      name: "",
      displayName: "",
      canReality: false
    };
  },
  computed: {
    preset() {
      return player.reality.enhancedPresets[this.saveslot - 1];
    },
  },
  methods: {
    update() {
      this.name = player.reality.enhancedPresets[this.saveslot - 1].name;
      this.displayName = this.name === "" ? this.saveslot : this.name;
      this.canReality = TimeStudy.reality.isBought;
    },
    nicknameBlur(event) {
      const newName = event.target.value.slice(0, 4).trim();
      if (!this.isASCII(newName)) return;

      const existingNames = player.reality.enhancedPresets.map(p => p.name);
      if (existingNames.includes(newName)) return;

      this.preset.name = newName;
      this.name = this.preset.name;
    },
    hideContextMenu() {
      this.$viewModel.currentContextMenu = null;
    },
    // This is largely done because of UI reasons - there is no Unicode specification for character width, which means
    // that arbitrary Unicode inputs can allow for massive text overflow
    isASCII(input) {
      // eslint-disable-next-line no-control-regex
      return !/[^\u0000-\u00ff]/u.test(input);
    },
    save() {
      this.hideContextMenu();
      this.preset.enhancements = Achievements.returnCurrrentEnhancementsAsPreset();
      const presetName = this.name ? `Enhancement preset "${this.name}"` : "Enhancement preset";
      GameUI.notify.reality(`${presetName} saved in slot ${this.saveslot}`);
    },
    load() {
      this.hideContextMenu();
      if (this.preset.enhancements) {
        Achievements.applyEnhancementPreset(Achievements.truncateInput(this.preset.enhancements));

        const presetName = this.name ? `Enhancement preset "${this.name}"` : "Enhancement preset";
        GameUI.notify.reality(`${presetName} loaded from slot ${this.saveslot}`);
      } else {
        Modal.message.show("This Enhancements list currently contains no Achievements.");
      }
    },
    // This function assumes you can auto-reality, which should be true at the time you unlock presets.
    respecAndLoad() {
      if (this.canReality) {
        // I manually remove Enhancements and curses so that the new Enhancements and curses can be applied
        // before a Reality. This makes Enhancements with starting resources and curses work inmediately
        Achievements.disEnhanceAll();
        Achievements.uncurseAll();
        
        Achievements.applyEnhancementPreset(Achievements.truncateInput(this.preset.enhancements));
        autoReality();
      }
    },
    deletePreset() {
      this.hideContextMenu();
      if (this.preset.enhancements) Modal.enhancementString.show({ id: this.saveslot - 1, deleting: true });
      else Modal.message.show("This Enhancements list currently contains no Achievements.");
    },
    handleExport() {
      this.hideContextMenu();
      copyToClipboard(this.preset.enhancements);
      const presetName = this.name ? `Enhancement preset "${this.name}"` : "Enhancement preset";
      GameUI.notify.reality(`${presetName} exported from slot ${this.saveslot} to your clipboard`);
    },
    edit() {
      Modal.enhancementString.show({ id: this.saveslot - 1 });
    }
  },
};
</script>

<template>
  <HoverMenu class="l-acheh-save-load-btn__wrapper">
    <template #object>
      <button
        class="l-acheh-save-load-btn c-acheh-save-load-btn"
        @click.shift.exact="save"
        @click.exact="load"
      >
        {{ displayName }}
      </button>
    </template>
    <template #menu>
      <div class="l-acheh-save-load-btn__menu c-acheh-save-load-btn__menu">
        <span ach-tooltip="Set a custom name (up to 4 ASCII characters)">
          <input
            type="text"
            size="4"
            maxlength="4"
            class="l-acheh-save-load-btn__menu-rename c-acheh-save-load-btn__menu-rename"
            :value="name"
            @keyup.esc="hideContextMenu"
            @blur="nicknameBlur"
          >
        </span>
        <div
          class="l-acheh-save-load-btn__menu-item c-acheh-save-load-btn__menu-item"
          @click="edit"
        >
          Edit
        </div>
        <div
          class="l-acheh-save-load-btn__menu-item c-acheh-save-load-btn__menu-item"
          @click="handleExport"
        >
          Export
        </div>
        <div
          class="l-acheh-save-load-btn__menu-item c-acheh-save-load-btn__menu-item"
          @click="save"
        >
          Save
        </div>
        <div class="l-acheh-save-load-btn__menu-item">
          <div
            class="c-acheh-save-load-btn__menu-item"
            @click="load"
          >
            Load
          </div>
          <div class="c-acheh-save-load-btn__menu-item__hover-options">
            <div
              :class="{
                'c-acheh-save-load-btn__menu-item__hover-option': true,
                'c-acheh-save-load-btn__menu-item__hover-option--disabled': !canReality,
              }"
              @click="respecAndLoad"
            >
              Respec and Load
            </div>
          </div>
        </div>
        <div
          class="l-acheh-save-load-btn__menu-item c-acheh-save-load-btn__menu-item"
          @click="deletePreset"
        >
          Delete
        </div>
      </div>
    </template>
  </HoverMenu>
</template>

<style scoped>
.c-acheh-save-load-btn {
  font-family: Typewriter, serif;
  font-size: 1.35rem;
  font-weight: bold;
  border: 0.1rem solid #98a51f;
  border-radius: var(--var-border-radius, 4px);
  transition-duration: 0.2s;
  color: #c6d63a;
  background: #232028;
  cursor: pointer;
}
.c-acheh-save-load-btn:hover {
  color: #232028;
  background: #c6d63a;
}

.l-acheh-save-load-btn__wrapper {
  position: relative;
  margin: 0.3rem;
}

.l-acheh-save-load-btn {
  min-width: 2rem;
}

.l-acheh-save-load-btn__menu {
  position: absolute;
  top: 19.7rem;
  left: 50%;
  padding: 0.5rem 0;
  z-index: 2;
  transform: translate(-50%, -100%);
}

.c-acheh-save-load-btn__menu {
  text-align: left;
  font-family: Typewriter;
  font-size: 1.4rem;
  font-weight: bold;
  color: white;
  background: black;
  border-radius: var(--var-border-radius, 0.5rem);
}

.l-acheh-save-load-btn__menu::after {
  content: "";
  position: absolute;
  top: -0.6rem;
  left: 50%;
  rotate: 180deg;
  border-color: black transparent transparent;
  border-style: solid;
  border-width: var(--var-border-width, -0.5rem);
  margin-left: -0.5rem;
}

.l-acheh-save-load-btn__menu-rename {
  margin: 0.3rem 0.5rem 0.5rem 0.7rem;
}

.c-acheh-save-load-btn__menu-rename {
  text-align: left;
  font-family: Typewriter;
  font-size: 1.4rem;
  font-weight: bold;
  border: none;
  border-radius: var(--var-border-radius, 0.3rem);
  padding: 0.2rem;
}

.l-acheh-save-load-btn__menu-item {
  position: relative;
  cursor: pointer;
}

.c-acheh-save-load-btn__menu-item {
  text-align: left;
  padding: 0.25rem 1rem;
}

.c-acheh-save-load-btn__menu-item:hover {
  color: black;
  background: white;
}

.c-acheh-save-load-btn__menu-item__hover-options {
  visibility: hidden;
  width: fit-content;
  position: absolute;
  top: 0;
  left: 100%;
  opacity: 0;
  color: white;
  background: black;
  border: 0.1rem solid black;
  border-radius: var(--var-border-width, 0.5rem);
  transform: translateX(0.5rem);
  transition: visibility 0.2s, opacity 0.2s;
  transition-delay: 0.5s;
  cursor: pointer;
}

.c-acheh-save-load-btn__menu-item__hover-option {
  white-space: nowrap;
  padding: 0.25rem 1rem;
}

.c-acheh-save-load-btn__menu-item__hover-options::after {
  content: "";
  position: absolute;
  /* A single menu item is 26px tall, minus 5px from the border */
  top: 0.8rem;
  right: 100%;
  border-top: 0.5rem solid transparent;
  border-right: 0.5rem solid black;
  border-bottom: 0.5rem solid transparent;
}

.c-acheh-save-load-btn__menu-item:hover,
.c-acheh-save-load-btn__menu-item__hover-option:hover {
  color: black;
  background: white;
}

.l-acheh-save-load-btn__menu-item:hover .c-acheh-save-load-btn__menu-item__hover-options {
  visibility: visible;
  opacity: 1;
  transition-delay: 0s;
}

.c-acheh-save-load-btn__menu-item__hover-option--disabled {
  opacity: 0.7;
  cursor: default;
}

.c-acheh-save-load-btn__menu-item__hover-option--disabled:hover {
  color: white;
  background: transparent;
}
</style>
