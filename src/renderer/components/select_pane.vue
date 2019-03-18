<style scoped="">
.select_item_ct{
  position: relative;
}
.select_item_ct:hover{
  z-index: 1;
}
.select_item{
  font-size: 14px;
  color: #3E3F42;
  font-weight: 300;
  display: flex;
  align-items: center;
}
.select_text{
  font-size: 14px;
  margin-right: 0px;
}
.select_options{
  position: relative;
  height: 38px;
  border: 1px solid #D8DCE6;
  background-color: #fff;
  border-radius: 4px;
  padding-left: 18px;
  padding-right: 70px;
  display: flex;
  align-items: center;
  box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.08);
  font-weight: 400;
  white-space: nowrap;  
}
.multi_ct .select_options{
  height: auto;
  min-height: 38px;
  flex-wrap: wrap;
  padding-top: 4px;
}
.select_drop_arrow{
  display: inline-block;
  background-image: url('../assets/select_drop_arrow.svg');
  width: 11px;
  height: 7px;
  position: absolute;
  right: 12px;
}
.select_list{
  position: absolute;
  min-width: 100%;
  top: 36px;
  background: #fff;
  border: 1px solid #D8DCE6;
  left: -1px;
  box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.08);
  box-sizing: content-box;
}
.s_item{
  height: 38px;
  display: flex;
  align-items: center;
  padding-left: 18px;
  padding-right: 18px;
  white-space: nowrap;
  position: relative;
}
.s_item:hover{
  background: #eee;
  cursor: pointer;
}
.s_item .selected_mark{
  width: 10px;
  height: 10px;
  border-radius: 20px;
  background: #1284e7;
  position: absolute;
  right: 20px;
}
.disabled_select{
  background-color: #eee
}
.z_index_1{
  z-index: 1;
}
.multi_tag{
  background-color: #eaedf3;
  padding: 1px 7px;
  border-radius: 40px;
  font-size: 12px;
  margin-right: 10px;
  color: #333333c4;
  position: relative;
  padding-right: 33px;
  display: flex;
  align-items: center;
  box-shadow: 0px 0px 2px #7b8187;

  margin-bottom: 4px;
}
.multi_tag .close_icon{
  position: absolute;
  width: 10px;
  height: 10px;
  top: auto;
  z-index: 0;
}
.disabled_select .multi_tag{
  padding-right: 20px;
}
.disabled_select .multi_tag .close_icon{
  display: none;
}
.pane_load_more{
  margin-top: 10px;
  height: 40px;
  margin-bottom: 20px;
  min-width: 100px;
}
.avatar{
  height: 24px;
  width: 24px;
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
  border-radius: 24px;
  margin-right: 8px;
}
.text_val{

}
.mobile_number{
  margin-left: 10px;
  color: #1a69de;
  font-size: 12px;
}
.list_pane{
  max-height: 400px;
  overflow-y: scroll;
}
.pane_no_data{
  padding: 0px;
  line-height: 30px;
  padding-bottom: 10px;
}
</style>
<template>
  <div class="select_item_ct" v-bind:class="{'multi_ct': multi}" ref="el">
    <div class="select_item">
        <div class="select_text">
        </div>
        <div class="select_options" @click.self="toggle" v-bind:class="{'disabled_select': is_disabled}">
          <template v-for="item in list" v-if="item.value === value && !multi">
            <!-- {{ item.text }} -->
            <div class="avatar" v-bind:style="get_bg(item.avatar)" v-if="item.avatar" @click.self="toggle"></div>
            <div class="text_val" @click.self="toggle">{{item.text}}</div>
            <div class="mobile_number" v-if="item.mobile_number" @click.self="toggle">{{ item.mobile_number }}</div>
            <div class="mobile_number" v-if="item.no" @click.self="toggle">{{ item.no }}</div>

          </template>
          <template v-for="item in list" v-if="value.find && value.indexOf(item.value) > -1 && multi" >
            <div class="multi_tag">

              <div class="avatar" v-bind:style="get_bg(item.avatar)" v-if="item.avatar" @click.self="toggle"></div>
              <div class="text_val" @click.self="toggle">{{item.text}}</div>
              <div class="mobile_number" v-if="item.mobile_number" @click.self="toggle">{{ item.mobile_number }}</div>

              <div class="close_icon"  @click="delete_val(item)">
                <div class="close_icon_1"></div>
                <div class="close_icon_2"></div>
              </div>
            </div>
          </template>
          <span class="select_drop_arrow" @click.self="toggle"></span>
          <div class="select_list" v-if="is_visible" v-bind:style="pane_style" v-bind:class="{'z_index_1': is_visible}">
            <slot></slot>
            <div class="list_pane">
              <div class="s_item" v-if="show_default_list" @click="select(item)" v-for="item in list">
                <div class="selected_mark" v-if="value === item.value"></div>
                <div class="avatar" v-bind:style="get_bg(item.avatar)" v-if="item.avatar"></div>
                <div class="text_val">{{item.text}}</div>
                <div class="mobile_number" v-if="item.mobile_number">{{ item.mobile_number }}</div>
                <div class="mobile_number" v-if="item.no">{{ item.no }}</div>
              </div>

              <template v-if="need_load_more">
                <div class="load_more pane_load_more" @click.self="$emit('load_more')" v-if="show_load_more && !on_load_more">加载更多</div>
                <div class="load_more pane_load_more" v-if="on_load_more && show_load_more">正在加载...</div>
                <div class="no_data pane_no_data" v-if="!show_load_more">
                  没有更多了
                </div>
              </template>
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
      style: {},
      is_visible: false,
      pre_val: ''
    }
  },
  props: {
    text: {
      type: String,
      default () {
        return '';
      }
    },
    is_disabled: {
      type: Boolean,
      default () {
        return false;
      }
    },
    multi: {
      type: Boolean,
      default () {
        return false;
      }
    },
    value: {
      type: String,
      default () {
        return 1;
      }
    },
    pane_style: {
      type: Object,
      default () {
        return {}
      }
    },
    list: {
      type: Array,
      default () {
        return [
            {
              text: '在职',
              value: '1'
            },
            {
              text: '离职',
              value: '0'
            }
          ]
      },
    },
    show_load_more: {
      type: Boolean,
      default () {
        return false;
      }
    },
    need_load_more: {
      type: Boolean,
      default () {
        return false;
      }
    },
    on_load_more: {
      type: Boolean,
      default () {
        return false;
      }
    },

    show_default_list: {
      type: Boolean,
      default () {
        return true;
      }
    }
  },
  mounted () {
    document.body.addEventListener('click', (e) => {
      if(this.$refs.el && !this.$refs.el.contains(e.target)){
        this.is_visible = false;
        this.$emit('hide_pane');
      }
    });
    if(this.multi){
      if(this.value.splice){
        this.pre_val = new Set(this.value);
      }else{
        this.pre_val = new Set();
        this.pre_val.add(this.value);
      }
      this.$emit('input', [...this.pre_val]);
    }else{
      this.pre_val = this.value;
    }
  },
  methods: {
    get_bg (pic) {
      return {
        backgroundImage: `url(${pic})`
      }
    },
    change_zindex (z_index) {
      this.style = {
        'zIndex': z_index
      }
    },
    update_val () {
      let val = '';
      if(this.multi){
        val = [...this.pre_val];
      }else{
        val = this.pre_val;
      }
      this.$emit('input', val);
    },
    select (item) {
      let val = '';
      if(this.multi){
        this.pre_val.add(item.value);
        val = [...this.pre_val];
      }else{
        this.pre_val = item.value;
        val = this.pre_val;
      }
      this.$emit('input', val);
      this.is_visible = false;
    },
    delete_val (item) {
      let val = '';
      if(this.multi){
        this.pre_val.delete(item.value);
        val = [...this.pre_val];
      }else{
        this.pre_val = item.value;
        val = this.pre_val;
      }
      this.$emit('input', val);
    },
    toggle () {
      if(this.is_disabled) return ;
      if(this.is_visible){
        this.is_visible = false;
        this.change_zindex(0);
        this.$emit('hide_pane');
        return ;
      }
      this.is_visible = true;
      this.change_zindex(1);
    }
  }
}
</script>