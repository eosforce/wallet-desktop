<template>
  <div>

    <template v-for="row in list">

      <div class="field_item" v-if="row.type == 'input'">
        <div class="static-label form_label_item">
          <span>{{$t(row.placeholder)}}</span>
          <span class="" style="margin-top: 10px;">
            <input v-model="row.value" v-on:input="handle" min="0"  class="input" type="number" step="1"  required />
            <p class="help is-danger" v-if="row.error">
              {{ row.error }}
            </p>
            <p class="help is-danger"></p>
          </span>
        </div>
      </div>

      <div class="field_item" v-if="row.type == 'select_pane'">
        <div class="static-label form_label_item">
          <span>{{$t(row.placeholder)}}</span>
          <span class="control">
            <select_pane v-model:value="row.value" v-on:input="handle" v-bind:list="row.list"></select_pane>
          </span>
        </div>
      </div>

      <div class="field_item" v-if="row.type == 'text' && !row.hide ">
        <div class="static-label form_label_item">
          <span>{{$t(row.placeholder)}}</span>
          <span class="static-text">
            <input type="hidden" v-model="row.value" v-on:input="handle" />
            {{ row.value | formatNumber({p: 0, showSymbol: true, symbol: 'EOSC'}) }}
          </span>
        </div>
      </div>

    </template>
  </div>
</template>
<script>
import select_pane from '@/components/select_pane.vue'
export default {
  data () {
    return {

    }
  },
  props: {
    list: {
      type: Array,
      default () {
        return [];
      }
    }
  },
  methods: {
    handle (event, row) {
      console.error('change');
      this.$emit('form_changed', '');
    }
  },
  components: {
    select_pane
  }
}
</script>