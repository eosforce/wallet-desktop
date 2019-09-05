<template>
  <div>

    <template v-for="row in list">

      <div class="field_item" v-if="row.type == 'input' && !row.hide ">
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
            <p class="help is-danger" v-if="row.error">
              {{ row.error }}
            </p>
          </span>
        </div>
      </div>

      <div class="field_item" v-if="row.type == 'text' && !row.hide ">
        <div class="static-label form_label_item">
          <span>{{$t(row.placeholder)}}</span>
          <span class="static-text">
            <input type="hidden" v-model="row.value" v-on:input="handle" />
            {{ row.value | formatNumber({p: 0, showSymbol: true, symbol: 'EOSC'}) }}
            <p class="help is-danger" v-if="row.error">
              {{ row.error }}
            </p>
          </span>
        </div>
      </div>

      <!-- <div class="field_item">
        <div class="static-label form_label_item">
          <span>{{$t(row.placeholder)}}</span>
          <span class="control">
            <select_pane v-model:value="row.value" v-on:input="handle" v-bind:list="row.list"></select_pane>
          </span>
        </div>
      </div> -->

      <div class="form_label_item static-label"  v-if="row.type == 'select'">
        <span class="white_ft">{{$t(row.placeholder)}}</span>
        <Select v-bind:select_list='row.list' v-model="row.value" v-on:input="handle"></Select>
      </div>

      <!-- Select -->

    </template>
  </div>
</template>
<script>
import select_pane from '@/components/select_pane.vue'
import Select from '@/views/components/select.vue'
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
      this.$emit('form_changed', '');
    }
  },
  components: {
    select_pane,
    Select
  }
}
</script>