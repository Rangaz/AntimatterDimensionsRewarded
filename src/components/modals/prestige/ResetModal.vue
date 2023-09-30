<script>
import ModalWrapperChoice from "@/components/modals/ModalWrapperChoice";

export default {
  name: "ResetModal",
  components: {
    ModalWrapperChoice,
  },
  props: {
    header: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    gainedResources: {
      type: String,
      required: true
    },
    startingResources: {
      type: String,
      required: false,
      default: undefined
    },
    autobuyerWarning: { // Used in my mod where disabling an autobuyer would
      // make a reset keep less resources.
      type: String,
      required: false,
      defauld: undefined
    },
    confirmOption: {
      type: String,
      required: false,
      default: undefined
    },
    confirmFn: {
      type: Function,
      required: true
    },
    alternateText: {
      type: String,
      required: false,
      default: undefined
    },
    alternateCondition: {
      type: Boolean,
      required: false,
      default: false
    }
  },
};
</script>

<template>
  <ModalWrapperChoice
    :option="confirmOption"
    @confirm="confirmFn"
  >
    <template #header>
      {{ header }}
    </template>
    <div v-if="!alternateCondition">
      <div class="c-modal-message__text">
        {{ message }}
        <br>
      </div>
      <br>
      <div class="c-modal-message__text">
        {{ gainedResources }}
      </div>
      <br>
      <div
        v-if="startingResources"
        class="c-modal-message__text"
      >
        {{ startingResources }}
      </div>
      <div
        v-if="autobuyerWarning"
        class="c-modal-message__text"
      >
        {{ autobuyerWarning }}
      </div>
    </div>
    <div v-else>
      <div class="c-modal-message__text">
        {{ alternateText }}
      </div>
    </div>
  </ModalWrapperChoice>
</template>