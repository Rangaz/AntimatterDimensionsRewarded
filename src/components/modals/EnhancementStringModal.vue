<script>
import { sha512_256 } from "js-sha512";

import ModalWrapperChoice from "@/components/modals/ModalWrapperChoice";
import PrimaryButton from "@/components/PrimaryButton";

import EnhancementStringPreview from "@/components/EnhancementStringPreview.vue";

let savedImportString = "";

// This is totally a 100% original modal for Enhancement presets and not
// a copy-paste of the Time Study presets modal
export default {
  name: "EnhancementStringModal",
  components: {
    ModalWrapperChoice,
    PrimaryButton,
    EnhancementStringPreview
  },
  props: {
    id: {
      type: Number,
      required: true,
    },
    deleting: {
      type: Boolean,
      required: false,
      default: false,
    }
  },
  data() {
    return {
      input: "",
      name: "",
      respecAndLoad: false,
      canReality: false
    };
  },
  computed: {
    // This modal is used by both study importing and preset editing, but is given an id of -1 when importing
    isImporting() {
      return this.id === -1;
    },
    modalTitle() {
      if (this.deleting) return `Deleting Enhancement Preset "${this.name}"`;
      return this.isImporting ? "Input your Enhancements" : `Editing Enhancement Preset "${this.name}"`;
    },

    achievementsList() {
      if (!this.hasInput || !this.inputIsValidEnhancements) return null;
      const achievementsList = this.parsedInput.split("|")[0].split(",").sort((a, b) => a - b).join(", ");
      if (achievementsList == "") return null;
      return "Importing without Enhancements will Enhance Achievements: " + achievementsList;
    },

    cursesList() {
      if (!this.hasInput || !this.inputIsValidEnhancements) return null;
      const cursesList = this.parsedInput.split("|")[1].split(",").sort((a, b) => a - b).join(", ");
      if (cursesList == "") return null;
      return "This will also curse next Reality the rows: " + cursesList;
    },
    
    invalidMessage() {
      if (!this.hasInput || this.inputIsValidEnhancements) return null;

      const preset = Achievements.readPreset(this.parsedInput, false);

      if (preset[1].length > 0) {
        // Pad the input with non-digits which we remove later in order to not cause erroneous extra matches within IDs
        // and limit the string length to stop excessive UI stretch.
        // The extra ',' allow to properly find the ids if they are at the start or end of the string.
        let coloredString = `#,${this.parsedInput.split("|")[0]},#`;
        if (coloredString.length > 300) coloredString = `${coloredString.slice(0, 297)}...`;

        for (const id of preset[1]) {
          coloredString = coloredString.replaceAll(`,${id},`,
            `,<span style="color: var(--color-bad);">${id}</span>,`);
        }
        return `Your import string has invalid achievement IDs: 
          ${coloredString.replaceAll("#", "").slice(1, -1).replaceAll(",", ", ")}<br><br>`;
      }
      if (preset[3].length > 0) {
        let coloredString = `#,${this.parsedInput.split("|")[1]},#`;
        if (coloredString.length > 300) coloredString = `${coloredString.slice(0, 297)}...`;

        for (const id of preset[3]) {
          coloredString = coloredString.replaceAll(`,${id},`,
            `,<span style="color: var(--color-bad);">${id}</span>,`);
        }
        return `Your import string has invalid curse IDs: 
          ${coloredString.replaceAll("#", "").slice(1, -1).replaceAll(",", ", ")}<br><br>`;
      }
    },

    // Some Achievements, like 57 & 88, require other Achievements to be Enhanced.
    // Warn if some of their requirements are missing in the preset.
    // Also warn if your preset has more Achievements than you can Enhance.
    // Also warn if you're Enhancing an Achievement that would be cursed
    warningMessage() {
      if (!this.hasInput || !this.inputIsValidEnhancements) return null;

      const searchedString = `,${this.parsedInput},`

      if (searchedString.includes(",136,") && !searchedString.includes(",115,")) {
        return "Warning: Achievement 136 requires Achievement 115 to be Enhanced. " + 
          "You may want to include 115 in your preset.";
      }

      if (searchedString.includes(",88,") && !searchedString.includes(",57,")) {
        return "Warning: Achievement 88 requires Achievement 57 to be Enhanced. " + 
          "You may want to include 57 in your preset.";
      }

      if (searchedString.includes(",57,") && !searchedString.includes(",32,")) {
        return "Warning: Achievement 57 requires Achievement 32 to be Enhanced. " + 
          "You may want to include 32 in your preset.";
      }

      // An array with every Achievement id, and another one with every Curse id.
      const achievementsInString = searchedString.slice(1, -1).split("|")[0].split(",");
      const cursesInString = searchedString.slice(1, -1).split("|")[1].split(",");


      // We want to look for duplicate ids, then display them
      // I don't know if performance is going to be a problem here
      const duplicates = [];
      // We also want to look for if an Enhanced Achievement is getting cursed
      const enhancedAndCursed = [];
      for (const id of achievementsInString) {
        if (achievementsInString.indexOf(id) != achievementsInString.lastIndexOf(id)) {
          duplicates.push(id);
          // Removing the farthest duplicate helps in doing less comparisons, and
          // avoid showing duplicate ids multiple times. They'll still appear more than
          // once if they are repeated 3 or more times, but I doubt I'll have to worry about that.
          achievementsInString.splice(achievementsInString.lastIndexOf(id), 1);
        }
        // The first digit is the column and the rest is the row
        if (cursesInString.includes(id.slice(0, -1))) enhancedAndCursed.push(id);
      }
      for (const id of cursesInString) {
        if (cursesInString.indexOf(id) != cursesInString.lastIndexOf(id)) {
          duplicates.push(id);
          cursesInString.splice(cursesInString.lastIndexOf(id), 1);
        }
      }
      if (enhancedAndCursed.length > 0) {
        return `Warning: You're Enhancing Achievements that will get cursed: 
          ${enhancedAndCursed.join(", ")}. You may want to remove these IDs or uncurse their row.`;
      }
      if (duplicates.length > 0) {
        return `Warning: Your preset includes the following duplicated IDs: ${duplicates.join(", ")}.
          You may want to remove the duplicates.`;
      }

      let achievementAmount = achievementsInString.length;
      const curseAmount = cursesInString.length;
      
      // Since some Achievements are free, we need to account for that.
      ["22", "61", "114", "126", "136"].forEach(value => achievementAmount -= achievementsInString.includes(value));
      
      // A few Enhancements are worth more Achievements
      achievementAmount += achievementsInString.includes("118") + 2 * achievementsInString.includes("138");
      
      // Every curse practically gives 2 free Achievements
      achievementAmount -= 2 * curseAmount;

      // We calculate how many elements are in the preset.
      if (achievementAmount > Achievements.totalEnhancementPoints) {
        return `Warning: Your preset includes ${formatInt(achievementAmount - 
          Achievements.totalEnhancementPoints)} more Achievements than you can Enhance.
          You may want to remove some IDs in your preset.`;
      }

      // If it has reached this point it means that nothing's wrong.
      return null;
    },
    
    truncatedInput() {
      return Achievements.truncateInput(this.input);
    },
    parsedInput() {
      return Achievements.parseInput(this.truncatedInput);
    },
    hasInput() {
      return this.truncatedInput !== "";
    },
    inputIsValid() {
      return this.inputIsValidEnhancements || this.inputIsSecret;
    },
    inputIsValidEnhancements() {
      const preset = Achievements.readPreset(this.parsedInput, false);
      return preset[1].length == 0 && preset[3].length == 0;
    },
    inputIsSecret() {
      // The button to open the modal and the actual modal itself display two different strings;
      // we should allow either to unlock the secret achievement
      const secretStrings = [
        "08b819f253b684773e876df530f95dcb85d2fb052046fa16ec321c65f3330608",
        "bb450c2a3869bae412ed0b4304dc229521fc69f0fdcc95b3b61460aaf5658fc4"
      ];
      return secretStrings.includes(sha512_256(this.input.toLowerCase()));
    },
    confirmText() {
      if (this.deleting) return "Delete";
      return this.isImporting ? "Import" : "Save";
    }
  },
  watch: {
    input(newInput) {
      savedImportString = newInput;
    }
  },
  // Needs to be assigned in created() or else they will end up being undefined when importing
  created() {
    const preset = player.reality.enhancedPresets[this.id];
    this.input = preset ? preset.enhancements : savedImportString;
    this.name = preset ? preset.name : "";
  },
  mounted() {
    this.$refs.input.select();
  },
  methods: {
    update() {
      this.canReality = TimeStudy.reality.isBought;
    },
    confirm() {
      if (this.deleting) {
        this.deletePreset();
      } else if (this.isImporting) {
        if (this.respecAndLoad && this.canReality) {
          player.reality.respecAchievements = true;
          autoReality();
          Achievements.applyEnhancementPreset(this.parsedInput);
          return;
        }
        this.importEnhancements();
      } else {
        this.savePreset();
      }
    },
    formatInput() {
      this.input = Achievements.formatAchievementsList(this.input);
    },
    fixInput() {
      // Remove invalid ids from the preset text
      if (!this.hasInput || Achievements.readPreset(this.parsedInput, false)[1].length == 0) return;

      let fixedString = `,${this.truncatedInput},`;
      // First fix invalid "rows a-b"s
      const allGroupedRows = Array.from(fixedString.matchAll(/rows?\d+-\d+/g));
      for (const groupedRow of allGroupedRows) {
        let boundaries = groupedRow.toString().slice(3 + groupedRow.toString().includes("s")).split("-");
        // If the group is inversed, flip it
        if (Number.parseInt(boundaries[0]) > Number.parseInt(boundaries[1])) {
          boundaries.reverse();
        }
        // If the left boundary is already too high, we'll remove the entire group.
        // If the right boundary is too high, we can fix that.
        if (Number.parseInt(boundaries[0]) > Achievements.maxEnhancedRow) {
          fixedString = fixedString.replaceAll(`,${groupedRow},`, `,`);
          continue;
        }
        if (Number.parseInt(boundaries[1]) > Achievements.maxEnhancedRow) {
          const fixedGroupedRow = "row" + boundaries[0].toString() + "-" + Achievements.maxEnhancedRow;
          fixedString = fixedString.replaceAll(groupedRow.toString(), fixedGroupedRow);
        }
      }


      // Next remove invalid "row X"s
      const allRows = Array.from(fixedString.matchAll(/row\d+/g));
      let invalidRows = allRows.map(value => {
        return value.toString().slice(3);
      });

      for (const rowId of invalidRows) {
        if (1 <= Number.parseInt(rowId) && Number.parseInt(rowId) <= Achievements.maxEnhancedRow) {
          
          continue;
        }
        fixedString = fixedString.replaceAll(`,row${rowId},`, `,`);
      }

      // Then we fix invalid "aa-bb"s. Because of how they work, they only give errors
      // if the Achievements they refer to can't be Enhanced
      const allGroups = Array.from(fixedString.matchAll(/\d+-\d+/g));
      for (const group of allGroups) {
        let boundaries = group.toString().split("-");
        // If the group is inversed, flip it
        if (Number.parseInt(boundaries[0]) > Number.parseInt(boundaries[1])) {
          boundaries.reverse();
        }
        // If the left boundary is already too high, we'll remove the entire group.
        // If the right boundary is too high, we can fix that.
        if (Number.parseInt(boundaries[0]) > Achievements.maxEnhancedRow * 10 + 8) {
          fixedString = fixedString.replaceAll(`,${group},`, `,`);
          continue;
        }
        if (Number.parseInt(boundaries[1]) > Achievements.maxEnhancedRow * 10 + 8) {
          const fixedGroup = boundaries[0].toString() + "-" + Achievements.maxEnhancedRow + "8";
          fixedString = fixedString.replaceAll(group.toString(), fixedGroup);
        }
      }

      for (const id of Achievements.readPreset(fixedString)[1]) {
        fixedString = fixedString.replaceAll(`,${id},`, `,`);
      }

      this.input = fixedString.slice(1, -1);
    },
    importEnhancements() {
      if (!this.inputIsValid) return;
      if (this.inputIsSecret) SecretAchievement(37).unlock();
      savedImportString = "";
      this.emitClose();
      Achievements.applyEnhancementPreset();
    },
    savePreset() {
      if (this.inputIsValid) {
        player.reality.enhancedPresets[this.id].enhancements = this.input;
        GameUI.notify.reality(`Enhancement preset ${this.name} successfully edited.`);
        this.emitClose();
      }
    },
    deletePreset() {
      const name = player.reality.enhancedPresets[this.id].name;
      const presetName = name ? `Enhancement preset "${name}"` : "Enhancement preset";
      player.reality.enhancedPresets[this.id].enhancements = "";
      player.reality.enhancedPresets[this.id].name = "";
      GameUI.notify.reality(`${presetName} deleted from slot ${this.id + 1}`);
    },
    achievementString(achievement) {
      return `${achievement.id}`;
    }
  },
};
</script>

<template>
  <ModalWrapperChoice
    :show-cancel="!inputIsValid"
    :show-confirm="inputIsValid"
    class="c-modal-import-tree"
    @confirm="confirm"
  >
    <template #header>
      {{ modalTitle }}
    </template>
    <input
      ref="input"
      v-model="input"
      type="text"
      maxlength="1500"
      class="c-modal-input c-modal-import-tree__input"
      :class="{ 'l-delete-input' : deleting }"
      :disabled="deleting"
      @keyup.enter="confirm"
      @keyup.esc="emitClose"
    >
    <div class="c-two-column">
      <div class="c-study-info l-modal-import-tree__tree-info">
        <div v-if="inputIsSecret">
          ???
        </div>
        <template>
          <div
            v-if="invalidMessage"
            class="l-modal-import-tree__tree-info-line"
            v-html="invalidMessage"
          />
          <div
          v-if="achievementsList"
          class="l-modal-import-tree__tree-info-line"
          v-html="achievementsList"
          />
          <div
          v-if="cursesList"
          class="l-modal-import-tree__tree-info-line"
          v-html="cursesList"
          />
          <div
            v-if="warningMessage"
            class="l-modal-import-tree__tree-info-line"
            style="color:orange"
            v-html="warningMessage"
          />
        </template>
        <PrimaryButton 
          v-if="!deleting && !inputIsValidEnhancements && hasInput"
          v-tooltip="'This will remove the invalid IDs in your preset.'"
          @click="fixInput"
        >
          Fix preset
        </PrimaryButton>
      </div>
      
      <div class="c-enhancement-preview">
        <EnhancementStringPreview
          :show-preview="inputIsValidEnhancements && hasInput"
          :new-enhancements="parsedInput"
          :disregard-current-enhancements="!isImporting || (canReality && respecAndLoad)"
        />
      </div>
      
    </div>
    <div v-if="!isImporting && inputIsValidEnhancements">
      <br>
      <PrimaryButton
        v-if="!deleting"
        v-tooltip="'This will format the Enhancement preset text, for example, changing \'a,b,c,d\' to \'a, b, c, d\'.'"
        @click="formatInput"
      >
        Format Preset Text
      </PrimaryButton>
    </div>
    <!--I think the isImporting property is useless to me, I'll remove this in the future-->
    <span v-if="isImporting">
      <br>
      <div
        v-tooltip="canReality ? '' : 'You are currently unable to reality, so this will reset with no reward.'"
        class="c-modal__confirmation-toggle"
        @click="respecAndLoad = !respecAndLoad"
      >
        <div
          :class="{
            'c-modal__confirmation-toggle__checkbox': true,
            'c-modal__confirmation-toggle__checkbox--active': respecAndLoad,
          }"
        >
          <span
            v-if="respecAndLoad"
            class="fas fa-check"
          />
        </div>
        <span class="c-modal__confirmation-toggle__text">
          Also respec Achievements and Reality
          <span
            v-if="!canReality"
            class="c-modal__confirmation-toggle__warning"
          >
            !
          </span>
        </span>
      </div>
    </span>
    <template #confirm-text>
      {{ confirmText }}
    </template>
  </ModalWrapperChoice>
</template>

<style scoped>
.c-two-column {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.c-study-info {
  width: 30rem;
  padding: 0 2rem;
}

.c-enhancement-preview {
  height: 100%;
  margin-right: 3rem;
}

.l-delete-input {
  color: var(--color-text);
  background-color: var(--color-disabled);
  pointer-events: none;
  user-select: none;
}

.c-modal__confirmation-toggle__text {
  opacity: 1;
}

.c-modal__confirmation-toggle__warning {
  display: inline-flex;
  /* stylelint-disable-next-line unit-allowed-list */
  width: 1em;
  /* stylelint-disable-next-line unit-allowed-list */
  height: 1em;
  justify-content: center;
  align-items: center;
  color: #332222;
  background: var(--color-bad);
  border-radius: 100%;
  margin-left: 0.3rem;
}
</style>
