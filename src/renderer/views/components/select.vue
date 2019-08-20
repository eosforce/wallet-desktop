<style scoped="">
.select_item_des{
  color: #909399;
  line-height: 1;
  font-size: 12px;
}
.slider_selected_item .select_item_des{
  color: #fff;
}
</style>
<template>
    <div class="field">
      <div class="control">
        <input class="input" v-model="value" type="hidden" required />
        <div class="slider_select">
          <div class="slider_select_item" v-bind:class="{'slider_selected_item': item.value == value}" @click="select_value(item.value)" v-for="item in select_list">
            <div>
              <div>{{ item.text }}</div>
              <div class="select_item_des">{{ item.des }}</div>
            </div>
          </div>
        </div>

      </div>
    </div>
</template>
<script>
export default {
  data () {
    return {
      selected_value: 0
    }
  },

  props: {
    select_list: {
      type: Array,
      default () {
        return [
          {value: 0, text: '增加'},
          {value: 1, text: '减少'}
        ]
      }
    },

    value: {
      type: String,
      default () {
        return 0;
      }
    }

  },

  methods: {

    select_value (value) {
      this.$emit('input', value);
    }

  }

}
</script>