<template>
  <td v-if="isHead && hasTitleSlot" class="af-tcell">
    <slot name="title" :table="table" :row="row" :extra="bus" :cell="cell"></slot>
  </td>
  <td v-else-if="isHead" v-text="cell" class="af-tcell"></td>
  <td v-else-if="isBody && hasFieldSlot" class="af-tcell">
    <slot name="field" :table="table" :row="row" :extra="bus" :cell="cell"></slot>
  </td>
  <td v-else-if="isBody && hasDefaultSlot" class="af-tcell">
    <slot :table="table" :row="row" :extra="bus" :cell="cell"></slot>
  </td>
  <td v-else-if="isBody" v-text="cell" class="af-tcell"></td>
  <td v-else-if="isFoot && hasNoteSlot" class="af-tcell">
    <slot name="note" :table="table" :row="row" :extra="bus" :cell="cell"></slot>
  </td>
  <td v-else v-text="cell" class="af-tcell"></td>
</template>
<script>
  export default {
    props: {
      title: String,
      field: String,
      note: String,
      row: Object,
      cell: null,
      table: Object,
      bus: Object,
      isHead: Boolean,
      isBody: Boolean,
      isFoot: Boolean
    },
    data () {
      return {
        hasTitleSlot: false,
        hasFieldSlot: false,
        hasNoteSlot: false,
        hasDefaultSlot: false
      }
    },
    mounted () {
      this.hasTitleSlot = !!(this.$scopedSlots.title || this.$slots.title)
      this.hasFieldSlot = !!(this.$scopedSlots.field)
      this.hasNoteSlot = !!(this.$scopedSlots.note)
      this.hasDefaultSlot = !!(this.$scopedSlots.default)
    }
  }
</script>