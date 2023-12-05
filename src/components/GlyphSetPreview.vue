<script>
import GlyphComponent from "@/components/GlyphComponent";
import GlyphSetName from "@/components/GlyphSetName";
import EnhancementStringPreview from "@/components/EnhancementStringPreview.vue";

export default {
  name: "GlyphSetPreview",
  components: {
    GlyphComponent,
    GlyphSetName,
    EnhancementStringPreview
  },
  props: {
    text: {
      type: String,
      required: false,
      default: ""
    },
    textHidden: {
      type: Boolean,
      required: false,
      default: false
    },
    glyphs: {
      type: Array,
      required: true
    },
    enhancements: {
      type: String,
      required: false,
      default: "11,33,55,77|2,4,6,8"
    },
    ignoreModifiedLevel: {
      type: Boolean,
      required: false,
      default: false
    },
    flipTooltip: {
      type: Boolean,
      required: false,
      default: false
    },
    isInModal: {
      type: Boolean,
      required: false,
      default: false
    },
    showName: {
      type: Boolean,
      required: false,
      default: true
    },
    forceNameColor: {
      type: Boolean,
      required: false,
      default: true
    },
    showSacrifice: {
      type: Boolean,
      required: false,
      default: false
    },
    noneText: {
      type: String,
      required: false,
      default: "(No Glyphs equipped)"
    },
    sort: {
      type: Boolean,
      required: false,
      default: true
    }
  },
  data() {
    return {
      realityGlyphBoost: 0,
      isMouseOver: false,
    };
  },
  computed: {
    orderedGlyphs() {
      if (!this.sort) return this.glyphs;
      const standardOrder = ["reality", "effarig", "power", "infinity", "replication", "time", "dilation",
        "cursed", "companion"];
      const order = Glyphs.copyForRecords(this.glyphs);
      // Technically doesn't stable sort between glyphs of the same type, probably fine though
      order.sort((a, b) => standardOrder.indexOf(a.type) - standardOrder.indexOf(b.type));
      return order;
    },
  },
  watch: {
    glyphs() {
      this.$recompute("orderedGlyphs");
    }
  },
  beforeDestroy() {
    clearTimeout(this.mouseOverInterval);
  },
  methods: {
    update() {
      // There should only be one reality glyph; this picks one pseudo-randomly if multiple are cheated/glitched in
      const realityGlyph = this.glyphs.filter(g => g.type === "reality")[0];
      this.realityGlyphBoost = realityGlyph
        ? GlyphEffects.realityglyphlevel.effect(realityGlyph.level)
        : 0;
    },
    showModal() {
      if (this.isInModal) return;
      Modal.glyphShowcasePanel.show({
        name: this.text,
        glyphSet: this.glyphs,
        closeEvent: GAME_EVENT.GLYPH_SET_SAVE_CHANGE,
        displaySacrifice: this.showSacrifice,
      });
    },
    // Necessary to force a re-render for the set name if the set itself changes
    glyphHash() {
      return Glyphs.hash(this.glyphs);
    },
    onEnhancementMouseEnter() {
      clearTimeout(this.mouseOverInterval);
      this.isMouseOver = true;
    },
    onEnhancementMouseLeave() {
      this.mouseOverInterval = setTimeout(() => this.isMouseOver = false, 300);
    },
  }
};
</script>

<template>
  <div>
    <span v-if="text && !textHidden">
      {{ text }}
      <br>
    </span>
    <span
      v-if="glyphs.length !== 0"
      :class="{ 'l-glyph-set-preview': !isInModal}"
      @click="showModal"
    >
      <GlyphSetName
        v-if="showName"
        :key="glyphHash()"
        :glyph-set="glyphs"
        :force-color="forceNameColor"
      />
      <GlyphComponent
        v-for="(g, idx) in orderedGlyphs"
        :key="idx"
        class="l-preview"
        :glyph="g"
        :show-sacrifice="showSacrifice"
        :draggable="false"
        :circular="true"
        :ignore-modified-level="ignoreModifiedLevel"
        :reality-glyph-boost="realityGlyphBoost"
        :flip-tooltip="flipTooltip"
        :is-in-modal="isInModal"
        size="3rem"
        :text-proportion="0.5"
        glow-blur="0.2rem"
        glow-spread="0.1rem"
      />
    </span>
    <span v-else>
      <GlyphSetName
        v-if="showName"
        :glyph-set="glyphs"
        :force-color="forceNameColor"
      />
      {{ noneText }}
    </span>
    <div 
      v-if="enhancements"
      class="fas fa-trophy l-enhancement-preview o-enhancement-preview"
      @mouseenter="onEnhancementMouseEnter"
      @mouseleave="onEnhancementMouseLeave">
      <div class="o-enhancement-preview__tooltip">
        <EnhancementStringPreview
          :show-preview="true"
          :new-enhancements="enhancements"
          :includeBorder="false"></EnhancementStringPreview>
      </div>
  </div>
  </div>
</template>

<style scoped>
.l-preview {
  margin: 0.2rem;
}
.l-enhancement-preview {
  margin: 0.4rem;
  position: relative;
}

.o-enhancement-preview__tooltip {
  width: 20.6rem;
  position: absolute;
  bottom: 2rem;
  z-index: 3;
  font-size: 1.4rem;
  opacity: 0;
  color: var(--color-text);
  background: var(--color-base);
  border: 0.1rem solid black;
  border-radius: var(--var-border-radius, 0.8rem);
  margin-left: -9.6rem;
  padding: 0.2rem;
  transition-duration: 0.3s;
  pointer-events: none;
  background: var(--color-base);
  border: 0.1rem solid var(--color-accent);
}

.o-enhancement-preview__tooltip::after {
  content: " ";
  width: 0;
  position: absolute;
  bottom: 0;
  left: 50%;
  z-index: 0;
  border-top: 0 solid black;
  border-right: 0.7rem solid transparent;
  border-left: 0.7rem solid transparent;
  margin-bottom: 0;
  margin-left: -0.7rem;
  transition-duration: 0.3s;
  border-top-color: var(--color-accent);
}
.o-enhancement-preview:hover .o-enhancement-preview__tooltip {
  bottom: 2.8rem;
  opacity: 1;
}

.o-enhancement-preview:hover .o-enhancement-preview__tooltip::after {
  border-top-width: 0.7rem;
  margin-bottom: -0.7rem;
}
</style>
