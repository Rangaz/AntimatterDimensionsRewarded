<script>
// This modal wil be used to link Glyph presets with Enhancement presets
import GlyphPreset from "@/components/GlyphPreset";
import ModalWrapperChoice from "@/components/modals/ModalWrapperChoice";
import PrimaryButton from "@/components/PrimaryButton";

export default {
  name: "GlyphEnhancementLinkModal",
  components: {
    GlyphPreset,
    ModalWrapperChoice,
    PrimaryButton,
  },
  props: {
    // What preset called this. Exactly one of these should be 0
    glyphPresetId: {
      type: Number,
      default: 0,
    },
    enhancementPresetId: {
      type: Number,
      default: 0,
    }
  },
  data() {
    return {
      glyphPresetSelected: 0,
      enhancementPresetSelected: 0,
      links: [0, 0, 0, 0, 0, 0, 0],
    };
  },
  computed: {
    glyphPresets() {
      return player.reality.glyphs.sets;
    },
    enhancementPresets() {
      return player.reality.enhancedPresets;
    },
    preexistingLink() {
      return this.links[this.glyphPresetId - 1] ?? 
        this.links.indexOf(this.enhancementPresetId) + 1;
    },
    preexistingLinkFromSelection() {
      if (this.glyphPresetSelected > 0) return this.links[this.glyphPresetSelected - 1];
      if (this.enhancementPresetSelected > 0) return this.links.indexOf(this.enhancementPresetSelected) + 1;
    },
    canConfirm() {
      return Boolean(this.glyphPresetSelected || this.enhancementPresetSelected);
    }
  },
  created() {
    this.links = Array.from(player.celestials.ra.glyphLinksToEnhancements);
  },
  methods: {
    presetName(preset, index) {
      return preset.name != "" ? preset.name : index;
    },
    selectGlyph(index) {
      this.glyphPresetSelected = index;
    },
    selectEnhancement(index) {
      this.enhancementPresetSelected = index;
    },
    confirmModal(unlink) {
      if (unlink) {
        if (this.preexistingLink <= 0) return;
        const spaceToUnlink = this.glyphPresetId > 0 ? this.glyphPresetId - 1 : 
          this.links.indexOf(this.enhancementPresetId);
        
        player.celestials.ra.glyphLinksToEnhancements[spaceToUnlink] = 0;
        EventHub.dispatch(GAME_EVENT.LINKS_CHANGED);
        // Unlink isn't passed through confirm so we have to close it manually
        this.emitClose();
        return;
      }
      if (!this.canConfirm) return;
      // Either one of the values inside the Math.max are 0.
      const glyphToLink = Math.max(this.glyphPresetId, this.glyphPresetSelected) - 1;
      const enhancementToLink = Math.max(this.enhancementPresetId, this.enhancementPresetSelected);
      // Since links are bidirectional there can't be 2 Glyph presets linked to the same Enhancement preset
      player.celestials.ra.glyphLinksToEnhancements = this.links.map(
        value => value == enhancementToLink ? 0 : value);
      
      player.celestials.ra.glyphLinksToEnhancements[glyphToLink] = enhancementToLink;
      EventHub.dispatch(GAME_EVENT.LINKS_CHANGED);
    }
  },
};
</script>

<template>
  <ModalWrapperChoice
    :show-confirm="canConfirm"
    @confirm="confirmModal(false)"
  >
    Links are bi-directional and index based.<br>
    They persist even after renaming or deleting one of the presets.<br>
    Links can be undone at any time by pressing the 'Unlink' button.
    <br>
    <div 
      v-if="glyphPresetId > 0"
      class="c-enhancement-button-area"
    >
      <br>
      <button 
        v-for="(enhancementPreset, index) in enhancementPresets"
        v-if="index != preexistingLink - 1"
        class="c-acheh-btn l-acheh-btn"
        :key="index"
        @click="selectEnhancement(index + 1)"
      >
        {{ presetName(enhancementPreset, index + 1) }}
      </button>
    </div>
    <div 
      v-else-if="enhancementPresetId > 0"
      class="c-glph-button-area"
    >
      <br>
      <button 
        v-for="(glyphPreset, index) in enhancementPresets"
        v-if="index != preexistingLink - 1"
        class="c-glyph-btn l-glyph-btn"
        :key="index"
        @click="selectGlyph(index + 1)"
      >
        <GlyphPreset
          :id="index"
          :show-options="false"
          :can-edit-name="false"
          :can-use-link="false"
          style="pointer-events: none"
        ></GlyphPreset>
      </button>
    </div>
    <div v-else>
      Something's wrong. Please tell Rangaz, the developer of this mod.
    </div>
    
    <div v-if="canConfirm">
      <br>
      This will link Glyph preset #{{ Math.max(glyphPresetId, glyphPresetSelected) }}
      with Enhancement preset #{{ Math.max(enhancementPresetId, enhancementPresetSelected) }}.
    </div>
    <div 
      v-if="preexistingLink > 0"
      :class="{'o-warning': canConfirm}"
    >
      <br>
      Glyph preset #{{ glyphPresetId ? glyphPresetId : preexistingLink }} has a link
      with Enhancement preset #{{ enhancementPresetId ? enhancementPresetId : preexistingLink }}.
      <span v-if="canConfirm">This will unlink them.</span>
    </div>
    <div
      v-if="preexistingLinkFromSelection > 0"
      class="o-warning"
    >
      Glyph preset #{{ glyphPresetSelected ? glyphPresetSelected : preexistingLinkFromSelection }} 
      has a link with Enhancement preset 
      #{{ enhancementPresetSelected ? enhancementPresetSelected : preexistingLinkFromSelection }}.
      This will unlink them.
    </div>
    <template #extra-buttons>
      <PrimaryButton
        class="o-primary-btn--width-medium c-modal-message__okay-btn"
        :enabled="preexistingLink > 0"
        @click="confirmModal(true)"
      >
        Unlink
      </PrimaryButton>
    </template>
    <template #confirm-text>Link</template>
  </ModalWrapperChoice>
</template>

<style scoped>
.c-enhancement-button-area {
  display: flex;
  flex-flow: row wrap;
  justify-content: center;
}
.c-acheh-btn {
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
.c-acheh-btn:hover {
  color: #232028;
  background: #c6d63a;
}

.l-acheh-btn {
  min-width: 2rem;
  margin: 0.3rem;
}
.c-glyph-button-area {
  display: flex;
  flex-flow: row wrap;
  justify-content: center;
}
.c-glyph-btn {
  font-family: Typewriter, serif;
  font-size: 1.35rem;
  font-weight: bold;
  border: 0.1rem solid var(--color-reality-dark);
  border-radius: var(--var-border-radius, 4px);
  transition-duration: 0.2s;
  color: var(--color-reality-dark);
  background: #232028;
  cursor: pointer;
}
.c-glyph-btn:hover {
  color: black;
  background-color: #a6d2a7;
}

.l-glyph-btn {
  min-width: 2rem;
  margin: 0.3rem;
}

.o-warning {
  color: var(--color-infinity);
}
</style>