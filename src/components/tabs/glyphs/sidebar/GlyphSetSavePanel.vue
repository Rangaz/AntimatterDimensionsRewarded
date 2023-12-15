<script>
import GlyphSetPreview from "@/components/GlyphSetPreview";
import GlyphPreset from "@/components/GlyphPreset";
import ToggleButton from "@/components/ToggleButton";

export default {
  name: "GlyphSetSavePanel",
  components: {
    ToggleButton,
    GlyphSetPreview,
    GlyphPreset,
  },
  data() {
    return {
      hasEquipped: true,
      glyphSets: 7,
      names: [],
      effects: false,
      rarity: false,
      level: false,
      glyphPresetsRespecAll: false,
      areLinksUnlocked: false,
    };
  },
  computed: {
    questionmarkTooltip() {
      return `Glyph Presets work like Time Study Loadouts, allowing you to equip a
        full set of previously-saved Glyphs`;
    },
    glyphPresetsRespecAllTooltip() {
      return `If Reality is possible, loading a preset will perform a Reality and unequip your current
        Glyphs before loading${this.areLinksUnlocked ? ". If there's a link, Enhancements will be respec as well" : ""}`;
    }
    /* noSet() {
      return `No Glyph Preset saved in this slot`;
    }, */
  },
  watch: {
    effects(newValue) {
      player.options.ignoreGlyphEffects = newValue;
    },
    rarity(newValue) {
      player.options.ignoreGlyphRarity = newValue;
    },
    level(newValue) {
      player.options.ignoreGlyphLevel = newValue;
    },
    glyphPresetsRespecAll(newValue) {
      player.options.glyphPresetsRespecAll = newValue;
    }
  },
  /* created() {
    this.on$(GAME_EVENT.GLYPHS_EQUIPPED_CHANGED, this.refreshGlyphSets);
    this.on$(GAME_EVENT.GLYPH_SET_SAVE_CHANGE, this.refreshGlyphSets);
    this.refreshGlyphSets();
    for (let i = 0; i < player.reality.glyphs.sets.length; i++) {
      this.names[i] = player.reality.glyphs.sets[i].name;
    }
  }, */
  methods: {
    update() {
      this.hasEquipped = Glyphs.activeList.length > 0;
      this.effects = player.options.ignoreGlyphEffects;
      this.rarity = player.options.ignoreGlyphRarity;
      this.level = player.options.ignoreGlyphLevel;
      this.areLinksUnlocked = Ra.unlocks.glyphEffectCountAndLinks.canBeApplied;
    },
    /* refreshGlyphSets() {
      this.glyphSets = player.reality.glyphs.sets.map(g => Glyphs.copyForRecords(g.glyphs));
    },
    setName(id) {
      const name = this.names[id] === "" ? "" : `: ${this.names[id]}`;
      return `Glyph Preset #${id + 1}${name}`;
    },
    saveGlyphSet(id) {
      if (!this.hasEquipped || player.reality.glyphs.sets[id].glyphs.length) return;
      player.reality.glyphs.sets[id].glyphs = Glyphs.active.compact();
      this.refreshGlyphSets();
      EventHub.dispatch(GAME_EVENT.GLYPH_SET_SAVE_CHANGE);
    },
    // A proper full solution to this turns out to contain an NP-hard problem as a subproblem, so instead we do
    // something which should work in most cases - we match greedily when it won't obviously lead to an incomplete
    // preset match, and leniently when matching greedily may lead to an incomplete set being loaded
    loadGlyphSet(set, id) {
      if (!this.setLengthValid(set)) return;
      let glyphsToLoad = [...set].sort((a, b) => -a.level * a.strength + b.level * b.strength);
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
          //console.log(idx);
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
          ${this.setName(id)}.`);
      } else {
        GameUI.notify.success(`Successfully loaded ${this.setName(id)}.`);
      }
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

        const filteredOptions = entry.options.filter(g => !toLoad.includes(g));
        if (filteredOptions.length === 0) continue;
        const selectedGlyph = filteredOptions[filteredOptions.length - 1];
        toLoad.push(selectedGlyph);
        slotsLeft--;
      }
      return toLoad;
    },
    deleteGlyphSet(id) {
      if (!player.reality.glyphs.sets[id].glyphs.length) return;
      if (player.options.confirmations.deleteGlyphSetSave) Modal.glyphSetSaveDelete.show({ glyphSetId: id });
      else {
        player.reality.glyphs.sets[id].glyphs = [];
        this.refreshGlyphSets();
        EventHub.dispatch(GAME_EVENT.GLYPH_SET_SAVE_CHANGE);
      }
    },
    nicknameBlur(event) {
      player.reality.glyphs.sets[event.target.id].name = event.target.value.slice(0, 20);
      this.names[event.target.id] = player.reality.glyphs.sets[event.target.id].name;
      this.refreshGlyphSets();
    },
    setLengthValid(set) {
      return set.length && set.length <= Glyphs.activeSlotCount;
    },
    loadingTooltip(set) {
      return this.setLengthValid(set) && this.hasEquipped
        ? "This set may not load properly because you already have some Glyphs equipped"
        : null;
    }, */
    glyphSetKey(set, index) {
      return `${index} ${Glyphs.hash(set)}`;
    }
  }
};
</script>

<template>
  <div class="l-glyph-sacrifice-options c-glyph-sacrifice-options l-glyph-sidebar-panel-size">
    <div class="c-preset-extra-btns">
      <span
        v-tooltip="questionmarkTooltip"
        class="o-questionmark"
      >
        ?
      </span>
      <span 
        v-tooltip="glyphPresetsRespecAllTooltip"
        class="fas fa-up-down l-top-right-btn c-top-right"
        :class="{ 'o-glyph-respec': glyphPresetsRespecAll}"
        @click="glyphPresetsRespecAll = !glyphPresetsRespecAll"></span>
    </div>
    <div class="l-glyph-set-save__header">
      When loading a preset, try to match the following attributes. "Exact" will only equip Glyphs
      identical to the ones in the preset. The other settings will, loosely speaking, allow "better" Glyphs to be
      equipped in their place.
    </div>
    <div class="c-glyph-set-save-container">
      <ToggleButton
        v-model="effects"
        class="c-glyph-set-save-setting-button"
        label="Effects:"
        on="Including"
        off="Exact"
      />
      <ToggleButton
        v-model="level"
        class="c-glyph-set-save-setting-button"
        label="Level:"
        on="Increased"
        off="Exact"
      />
      <ToggleButton
        v-model="rarity"
        class="c-glyph-set-save-setting-button"
        label="Rarity:"
        on="Increased"
        off="Exact"
      />
    </div>
    <div
      v-for="id of Array.range(0, glyphSets)"
      :key="id"
      class="c-glyph-single-set-save"
    >
      <GlyphPreset
        :id="id"
        :showName="true"
        :showOptions="true"
        :canUseLink="true"
      >
      </GlyphPreset>
      <!-- <div class="c-glyph-set-preview-area">
        <GlyphSetPreview
          :key="glyphSetKey(set, id)"
          :text="setName(id)"
          :text-hidden="true"
          :glyphs="set"
          :flip-tooltip="true"
          :none-text="noSet"
        />
      </div>
      <div class="c-glyph-single-set-save-flexbox">
        <div ach-tooltip="Set a custom name (up to 20 characters)">
          <input
            :id="id"
            type="text"
            size="20"
            maxlength="20"
            placeholder="Custom set name"
            class="c-glyph-sets-save-name__input"
            :value="names[id]"
            @blur="nicknameBlur"
          >
        </div>
        <div class="c-glyph-single-set-save-flexbox-buttons">
          <button
            class="c-glyph-set-save-button"
            :class="{'c-glyph-set-save-button--unavailable': !hasEquipped || set.length}"
            @click="saveGlyphSet(id)"
          >
            Save
          </button>
          <button
            v-tooltip="loadingTooltip(set)"
            class="c-glyph-set-save-button"
            :class="{'c-glyph-set-save-button--unavailable': !setLengthValid(set)}"
            @click="loadGlyphSet(set, id)"
          >
            Load
          </button>
          <button
            class="c-glyph-set-save-button"
          >
            Link
          </button>
          <button
            class="c-glyph-set-save-button"
            :class="{'c-glyph-set-save-button--unavailable': !set.length}"
            @click="deleteGlyphSet(id)"
          >
            Delete
          </button>
        </div>
      </div> -->
    </div>
  </div>
</template>

<style scoped>
.l-glyph-set-save__header {
  margin: 0 2rem 0;
}

.c-glyph-set-save-container {
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  justify-content: center;
  margin: 1rem auto 0;
}

.c-glyph-single-set-save-flexbox {
  width: 17rem;
}

.c-glyph-set-preview-area {
  width: 18rem;
}
.c-preset-extra-btns {
  position: absolute;
  display: flex;
  flex-direction: row;
  width: 100%;
  top: 0;
  z-index: 2;
  font-size: 1.3rem;
}
.c-top-right {
  left: calc(100% - 5rem);
}
.l-top-right-btn {
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  position: relative;
  border: var(--var-border-width, 0.2rem) solid;
  width: 2rem;
  height: 2rem;
  margin: 0.5rem 0.5rem 0 0;
  padding: 0.2rem;
}
.o-glyph-respec {
  background: var(--color-good);
}
</style>
