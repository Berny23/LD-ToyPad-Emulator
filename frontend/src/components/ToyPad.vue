<!-- This amazing Layout came from @Tivertoni -->
<template>
  <div
    id="toypad"
    class="container"
  >
    <v-overlay
      class="align-center justify-center"
      contained
      :model-value="!connected"
      persistent
    >
      <v-sheet color="warning">
        <v-container>{{ t('game_not_connected') }}</v-container>
      </v-sheet>
    </v-overlay>
    <div id="red-strip"></div>
    <div id="detail-00"></div>
    <div id="detail-01"></div>
    <div id="detail-02"></div>
    <div id="detail-03"></div>

    <div>
      <div class="drop-targets">
        <div
          id="toypad1"
          class="box"
          :style="getPadStyle(1)"
        >
          <toy-pad-item
            v-model:tag="tagPadOne"
            :index="1"
            :position="2"
          />
        </div>
        <div
          id="toypad2"
          class="box"
          :style="getPadStyle(2)"
        >
          <toy-pad-item
            v-model:tag="tagPadTwo"
            :index="2"
            :position="1"
          />
        </div>
        <div
          id="toypad3"
          class="box"
          :style="getPadStyle(3)"
        >
          <toy-pad-item
            v-model:tag="tagPadThree"
            :index="3"
            :position="3"
          />
        </div>
      </div>
      <div class="drop-targets">
        <div
          id="toypad4"
          class="box"
          :style="getPadStyle(4)"
        >
          <toy-pad-item
            v-model:tag="tagPadFour"
            :index="4"
            :position="2"
          />
        </div>
        <div
          id="toypad5"
          class="box"
          :style="getPadStyle(5)"
        >
          <toy-pad-item
            v-model:tag="tagPadFive"
            :index="5"
            :position="2"
          />
        </div>
        <div
          id="toypad6"
          class="box"
          :style="getPadStyle(6)"
        >
          <toy-pad-item
            v-model:tag="tagPadSix"
            :index="6"
            :position="3"
          />
        </div>
        <div
          id="toypad7"
          class="box"
          :style="getPadStyle(7)"
        >
          <toy-pad-item
            v-model:tag="tagPadSeven"
            :index="7"
            :position="3"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { ToyTag } from '@/types/tag'
  import { useI18n } from 'vue-i18n'
  import useSocket from '@/composables/useSocket'
  import { useAppStore } from '@/stores/app'

  const appStore = useAppStore()
  const { connected, padColors } = useSocket()
  const { t } = useI18n()
  const { toyTags } = storeToRefs(appStore)

  const tagPadOne = computed(() => {
    return toyTags.value.filter((x: ToyTag) => x.index === 1)
  })
  const tagPadTwo = computed(() => {
    return toyTags.value.filter((x: ToyTag) => x.index === 2)
  })
  const tagPadThree = computed(() => {
    return toyTags.value.filter((x: ToyTag) => x.index === 3)
  })
  const tagPadFour = computed(() => {
    return toyTags.value.filter((x: ToyTag) => x.index === 4)
  })
  const tagPadFive = computed(() => {
    return toyTags.value.filter((x: ToyTag) => x.index === 5)
  })
  const tagPadSix = computed(() => {
    return toyTags.value.filter((x: ToyTag) => x.index === 6)
  })
  const tagPadSeven = computed(() => {
    return toyTags.value.filter((x: ToyTag) => x.index === 7)
  })

  const getPadStyle = (index: number) => {
    if (padColors.value[index] == null) {
      return {}
    }
    // If a fade is active, use it; otherwise, fall back to the default padColors from your composable
    const { transition, color } = padColors.value[index]
    return {
      backgroundColor: color,
      transition
    }
  }
</script>

<style scoped lang="scss">
  $box-width: 9em;
  $box-padding: 12px;
  $box-border: 1px;
  $box-total: calc($box-width + 2 * $box-padding + 2 * $box-border);
  $middle-box-width: 9.75em;
  $detail-color-00: rgb(53, 53, 53);
  $detail-color-01: rgb(61, 61, 61);

  #toypad {
    align-content: end;
    background-color: #49494b;
    background-image: linear-gradient(#49494b, #424244);
    padding-top: 4em;
    width: fit-content;
    height: calc($box-width * 3);
  }

  .container {
    position: relative;
    margin: 1.5em auto;
    border-radius: 0.5rem;
    box-shadow:
      0 4px 8px 0 #00000033,
      0 6px 20px 0 #00000030;
    background-color: rgb(239, 239, 239);
    padding: 1em;
  }

  .box {
    will-change: background-color;
    margin: 0;
    border: solid $box-border $detail-color-01;
    border-radius: 0.5rem;
    padding: $box-padding;
    list-style-type: none;
    background-blend-mode: soft-light;
  }

  .drop-targets:first-of-type {
    justify-content: space-between;
    width: calc(100%);
  }

  .drop-targets {
    display: flex;
    position: relative;
    flex-direction: row;
    align-items: center;
    justify-content: space-around;
  }

  .drop-targets > .box {
    display: flex;
    align-items: center;
    justify-content: center;
    outline: none;
    border-radius: 0;
    background-color: #d8d7d8;
    width: $box-width;
    height: $box-width;
  }

  #red-strip {
    position: absolute;
    bottom: 0;
    left: 50%;
    width: calc($box-width / 2);
    transform: translate(-50%, 0);

    border: 2px solid rgb(34, 34, 34);
    border-bottom: none;
    background-color: rgb(224, 4, 4);
    height: 0.6em;
  }

  #detail-00 {
    position: absolute;
    bottom: 1em;
    left: 50%;
    width: calc($box-width / 2);
    transform: translate(-50%, 0);

    border-bottom: none;
    background-color: $detail-color-00;
    height: 0.1em;
  }

  #detail-01 {
    position: absolute;
    top: 1em;
    left: 50%;
    width: calc(100% - 2em);
    transform: translate(-50%, 0);

    border-bottom: none;
    background-color: $detail-color-00;
    height: 1px;
  }

  #detail-02 {
    position: absolute;
    top: 1em;
    left: 1em;
    height: calc($box-width);
    width: 1px;

    border-bottom: none;
    background-color: $detail-color-00;
  }

  #detail-03 {
    position: absolute;
    top: 1em;
    right: 1em;
    height: calc($box-width);
    width: 1px;

    border-bottom: none;
    background-color: $detail-color-00;
  }

  #toypad1 {
    border-bottom-color: transparent;
    padding-top: calc($box-total / 6);
  }

  #toypad2 {
    position: absolute;
    bottom: calc($middle-box-width / 2.4 + 1em);
    left: 50%;
    transform: translate(-50%, 0);
    margin: auto;
    border-radius: 100%;
    width: $middle-box-width;
    height: $middle-box-width;
  }

  #toypad3 {
    border-bottom-color: transparent;
    padding-top: calc($box-total / 6);
  }

  #toypad4 {
    border-top-color: transparent;
    border-right-color: transparent;
  }

  #toypad5 {
    border-left-color: transparent;
    margin-right: calc($box-width / 2);
  }

  #toypad6 {
    border-right-color: transparent;
  }

  #toypad7 {
    border-top-color: transparent;
    border-left-color: transparent;
  }

  .box {
    border: none;
  }
</style>
