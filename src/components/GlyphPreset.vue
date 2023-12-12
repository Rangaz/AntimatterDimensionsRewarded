<script>
import GlyphSetPreview from "@/components/GlyphSetPreview";
import { Modal } from "../core/modal";

// This was made into a distinct .vue file so that loading presets could be done in tabs oher than Glyphs.

export default {
  name: "GlyphPreset",
  components: {
    GlyphSetPreview
  },
  props: {
    id: {
      type: Number,
      required: true,
    },
    showName: {
      type: Boolean,
      default: true,
    },
    canEditName: {
      type: Boolean,
      default: true,
    },
    showOptions: {
      type: Boolean,
      default: true,
    },
    canUseLink: {
      type: Boolean,
      required: true,
    }
  },
  data() {
    return {
      hasEquipped: true,
      glyphSet: [],
      name: "",
      effects: false,
      rarity: false,
      level: false,
      areLinksUnlocked: false,
      linkedEnhancementPreset: 0, // Refers to the number id
      canReality: false,
      respecAll: false,
    };
  },
  computed: {
    noSet() {
      return `No Glyph Preset saved in this slot`;
    },
    enhancedPreset() {
      return this.linkedEnhancementPreset ? player.reality.enhancedPresets
        [this.linkedEnhancementPreset - 1].enhancements : "";
    }
  },
  created() {
    this.on$(GAME_EVENT.GLYPHS_EQUIPPED_CHANGED, this.refreshGlyphSet);
    this.on$(GAME_EVENT.GLYPH_SET_SAVE_CHANGE, this.refreshGlyphSet);
    this.refreshGlyphSet();
    this.name = player.reality.glyphs.sets[this.id].name;
  },
  methods: {
    update() {
      this.hasEquipped = Glyphs.activeList.length > 0;
      this.effects = player.options.ignoreGlyphEffects;
      this.rarity = player.options.ignoreGlyphRarity;
      this.level = player.options.ignoreGlyphLevel;
      this.areLinksUnlocked = Ra.unlocks.glyphEffectCountAndLinks.canBeApplied;
      this.linkedEnhancementPreset = this.areLinksUnlocked && this.canUseLink ? 
        player.celestials.ra.glyphLinksToEnhancements[this.id] : 0;
      this.canReality = TimeStudy.reality.isBought && player.records.thisReality.maxEP.exponent >= 4000;
      this.respecAll = player.options.glyphPresetsRespecAll;
    },
    refreshGlyphSet() {
      this.glyphSet = Glyphs.copyForRecords(player.reality.glyphs.sets[this.id].glyphs);
    },
    setName() {
      const name = this.name === "" ? "" : `: ${this.name}`;
      return `Glyph Preset #${this.id + 1}${name}`;
    },
    saveGlyphSet() {
      if (!this.hasEquipped || player.reality.glyphs.sets[this.id].glyphs.length) return;
      player.reality.glyphs.sets[this.id].glyphs = Glyphs.active.compact();
      this.refreshGlyphSet();
      EventHub.dispatch(GAME_EVENT.GLYPH_SET_SAVE_CHANGE);
    },
    // A proper full solution to this turns out to contain an NP-hard problem as a subproblem, so instead we do
    // something which should work in most cases - we match greedily when it won't obviously lead to an incomplete
    // preset match, and leniently when matching greedily may lead to an incomplete set being loaded
    loadGlyphSet(set) {
      if (!this.setLengthValid(set)) return;
      let glyphsToLoad = [...set];
      const activeGlyphs = [...Glyphs.active.filter(g => g)];

      // Create an array where each entry contains a single active glyph and all its matches in the preset which it
      // could fill in for, based on the preset loading settings
      const activeOptions = [];
      for (const glyph of activeGlyphs) {
        const options = Glyphs.findByValues(glyph, glyphsToLoad, {
          level: this.level ? -1 : 0,
          strength: this.rarity ? -1 : 0,
          effects: this.effects ? -1 : 0
        });
        activeOptions.push({ glyph, options });
      }

      // Using the active glyphs one by one, select matching to-be-loaded preset glyphs to be removed from the list.
      // This makes sure the inventory doesn't attempt to match a glyph which is already satisfied by an equipped one
      const selectedFromActive = this.findSelectedGlyphs(activeOptions, 5);
      for (const glyph of selectedFromActive) glyphsToLoad = glyphsToLoad.filter(g => g !== glyph);

      // For the remaining glyphs to load from the preset, find all their appropriate matches within the inventory.
      // This is largely the same as earlier with the equipped glyphs
      const remainingOptions = [];
      for (let index = 0; index < glyphsToLoad.length; index++) {
        const glyph = glyphsToLoad[index];
        const options = Glyphs.findByValues(glyph, Glyphs.sortedInventoryList, {
          level: this.level ? 1 : 0,
          strength: this.rarity ? 1 : 0,
          effects: this.effects ? 1 : 0
        });
        remainingOptions[index] = { glyph, options };
      }

      // This is scanned through similarly to the active slot glyphs, except we need to make sure we don't try to
      // match more glyphs than we have room for
      const selectedFromInventory = this.findSelectedGlyphs(remainingOptions,
        Glyphs.active.countWhere(g => g === null));
      for (const glyph of selectedFromInventory) glyphsToLoad = glyphsToLoad.filter(g => g !== glyph);

      // Actually equip the glyphs and then notify how successful (or not) the loading was
      let missingGlyphs = glyphsToLoad.length;
      for (const glyph of selectedFromInventory) {
        const idx = Glyphs.active.indexOf(null);
        if (idx !== -1) {
          // Special behaviour for my Companion Glyph slot
          if (glyph.type == "companion") {
            Glyphs.equip(glyph, 5);
            missingGlyphs--;
          } // idx 5 is my Companion Glyph slot
          else if (idx != 5) {
            Glyphs.equip(glyph, idx);
            missingGlyphs--;
          }
        }
      }
      if (missingGlyphs > 0) {
        GameUI.notify.error(`Could not find or equip ${missingGlyphs} ${pluralize("Glyph", missingGlyphs)} from
          ${this.setName()}.`);
      } else {
        GameUI.notify.success(`Successfully loaded ${this.setName()}.`);
      }
      if (this.enhancedPreset && this.canUseLink) this.loadEnhancementPreset();
    },
    // Given a list of options for suitable matches to those glyphs and a maximum glyph count to match, returns the
    // set of glyphs which should be loaded. This is a tricky matching process to do since on one hand we don't want
    // early matches to prevent later ones, but on the other hand matching too leniently can cause any passed-on later
    // requirements to be too strict (eg. preset 1234 and equipped 234 could match 123, leaving an unmatchable 4).
    // The compromise solution here is to check how many choices the next-strictest option list has - if it only has
    // one choice then we pick conservatively (the weakest glyph) - otherwise we pick greedily (the strongest glyph).
    findSelectedGlyphs(optionList, maxGlyphs) {
      // We do a weird composite function here in order to make sure that glyphs get treated by type individually; then
      // within type they are generally ordered in strictest to most lenient in terms of matches. Note that the options
      // are sorted internally starting with the strictest match first
      const compFn = o => 1000 * (10 * o.glyph.type.length + o.glyph.type.codePointAt(0)) + o.options.length;
      optionList.sort((a, b) => compFn(a) - compFn(b));

      const toLoad = [];
      let slotsLeft = maxGlyphs;
      for (let index = 0; index < optionList.length; index++) {
        if (slotsLeft === 0) break;
        const entry = optionList[index];
        const greedyPick = index === optionList.length - 1 || optionList[index + 1].options.length > 1;

        const filteredOptions = entry.options.filter(g => !toLoad.includes(g));
        if (filteredOptions.length === 0) continue;
        const selectedGlyph = filteredOptions[greedyPick ? 0 : (filteredOptions.length - 1)];
        toLoad.push(selectedGlyph);
        slotsLeft--;
      }
      return toLoad;
    },
    deleteGlyphSet() {
      if (!player.reality.glyphs.sets[this.id].glyphs.length) return;
      if (player.options.confirmations.deleteGlyphSetSave) Modal.glyphSetSaveDelete.show({ glyphSetId: this.id });
      else {
        player.reality.glyphs.sets[this.id].glyphs = [];
        this.refreshGlyphSet();
        EventHub.dispatch(GAME_EVENT.GLYPH_SET_SAVE_CHANGE);
      }
    },
    openLinkModal() {
      if (!this.canUseLink || !this.areLinksUnlocked) return;
      Modal.glyphEnhancementLink.show({ glyphPresetId: this.id + 1 });
    },
    loadEnhancementPreset() {
      if (this.enhancedPreset == "") return;
      Achievements.applyEnhancementPreset(Achievements.parseInput(this.enhancedPreset));

      const presetName = player.reality.enhancedPresets
        [this.linkedEnhancementPreset - 1].name ? `Enhancement preset "${player.reality.enhancedPresets
        [this.linkedEnhancementPreset - 1].name}"` : "Enhancement preset";
      GameUI.notify.reality(`${presetName} loaded from slot ${this.linkedEnhancementPreset}`);
    },
    nicknameBlur(event) {
      player.reality.glyphs.sets[event.target.id].name = event.target.value.slice(0, 20);
      this.name = player.reality.glyphs.sets[event.target.id].name;
      this.refreshGlyphSet();
    },
    setLengthValid(set) {
      return set.length && set.length <= Glyphs.activeSlotCount;
    },
    loadingTooltip(set) {
      return this.setLengthValid(set) && this.hasEquipped
        ? "This set may not load properly because you already have some Glyphs equipped"
        : null;
    },
    glyphSetKey(set, index) {
      return `${index} ${Glyphs.hash(set)}`;
    }
  }
};
</script>

<template>
  <div>
    <div class="c-glyph-set-preview-area">
      <GlyphSetPreview
        :key="glyphSetKey(glyphSet, id)"
        :text="setName()"
        :text-hidden="true"
        :glyphs="glyphSet"
        :enhancements="enhancedPreset"
        :flip-tooltip="true"
        :none-text="noSet"
      />
    </div>
    <div class="c-glyph-single-set-save-flexbox">
      <div 
        v-if="showName"
        :ach-tooltip="canEditName ? 'Set a custom name (up to 20 characters)' : null"
      >
        <input
          v-if="canEditName"
          :id="id"
          type="text"
          size="20"
          maxlength="20"
          placeholder="Custom set name"
          class="c-glyph-sets-save-name__input"
          :value="name"
          @blur="nicknameBlur"
        >
        <span v-else
          class="c-glyph-sets-save-name"
        >
          {{ name ? name : "Glyph preset #" + (id + 1) }}
        </span>
      </div>
      <div 
        v-if="showOptions"
        class="c-glyph-single-set-save-flexbox-buttons"
      >
        <button
          class="c-glyph-set-save-button"
          :class="{'c-glyph-set-save-button--unavailable': !hasEquipped || glyphSet.length}"
          @click="saveGlyphSet()"
        >
          Save
        </button>
        <button
          v-tooltip="loadingTooltip(glyphSet)"
          class="c-glyph-set-save-button"
          :class="{'c-glyph-set-save-button--unavailable': !setLengthValid(glyphSet)}"
          @click="loadGlyphSet(glyphSet)"
        >
          Load
        </button>
        <button
          v-if="areLinksUnlocked"
          class="c-glyph-set-save-button"
          @click="openLinkModal()"
        >
          Link
        </button>
        <button
          class="c-glyph-set-save-button"
          :class="{'c-glyph-set-save-button--unavailable': !glyphSet.length}"
          @click="deleteGlyphSet()"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped> 
.c-glyph-single-set-save-flexbox {
  width: 17rem;
}

.c-glyph-set-preview-area {
  width: 18rem;
  float: left;
}

.c-glyph-sets-save-name {
  width: 17rem;
  height: 1.5rem;
  text-align: center;
  font-family: Typewriter, serif;
  font-size: 1.35rem;
  color: var(--color-reality-dark);
}
.s-base--dark .c-glyph-sets-save-name {
  color: var(--color-reality-light);
}
</style>
