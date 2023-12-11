<script>
// This modal wil be used to link Glyph presets with Enhancement presets
import GlyphSetPreview from "@/components/GlyphSetPreview";
import ModalWrapperChoice from "@/components/modals/ModalWrapperChoice";
import PrimaryButton from "@/components/PrimaryButton";

export default {
  name: "GlyphEnhancementLinkModal",
  components: {
    GlyphSetPreview,
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
    hasLink() {
      return Boolean(this.links[this.glyphPresetId - 1]) ?? 
        this.links.includes(this.enhancementPresetId);
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
    selectEnhancement(index) {
      this.enhancementPresetSelected = index;
    },
    confirmModal(unlink) {
      if (unlink) {
        if (!this.hasLink) return;
        const spaceToUnlink = this.glyphPresetId > 0 ? this.glyphPresetId - 1 : 
          this.links.indexOf(this.enhancementPresetId);
        
        player.celestials.ra.glyphLinksToEnhancements[spaceToUnlink] = 0;
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
        class="c-acheh-btn l-acheh-btn"
        :key="index"
        @click="selectEnhancement(index + 1)"
      >
        {{ presetName(enhancementPreset, index + 1) }}
      </button>
    </div>
    <div v-else-if="enhancementPresetId > 0">
      List of Glyph presets here.
    </div>
    <div v-else>
      Something's wrong. Please tell Rangaz, the developer of this mod.
    </div>
    <br>
    <div v-if="canConfirm">
      This will link Glyph preset #{{ Math.max(this.glyphPresetId, this.glyphPresetSelected) }}
      with Enhancement preset #{{ Math.max(this.enhancementPresetId, this.enhancementPresetSelected) }}.
    </div>
    <template #extra-buttons>
      <PrimaryButton
        class="o-primary-btn--width-medium c-modal-message__okay-btn"
        :enabled="hasLink"
        @click="confirmModal(true)"
      >
        Unlink
      </PrimaryButton>
    </template>
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
</style>