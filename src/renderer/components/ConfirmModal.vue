<template>
  <div class="modal modal-sm basic-modal is-active" v-if="show">
    <div class="modal-background"></div>
    <div class="modal-content" ref="autofocus" :style="{'width': width}">
      <div class="modal-header">
        <span class="modal-title">{{title}}</span>
        <span v-if="canClose" class="delete" @click="close"></span>
      </div>
      <div class="modal-body">
        <slot>
          <p class="has-text-weight-bold">{{content}}</p>
        </slot>
      </div>
      <div class="modal-footer">
        <a tabindex="-1" v-if="canClose" class="button cancel-button" :disabled="submitting" @click="close">取消</a>
        <a class="button is-link" :class="{'is-loading': submitting}" :disabled="submitting" @click="confirm">确定</a>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ConfirmModal',
  data() {
    return {};
  },
  props: {
    show: {
      type: Boolean,
      required: true,
    },
    submitting: {
      type: Boolean,
      required: false,
      default: false,
    },
    content: {
      type: String,
      required: false,
    },
    title: {
      type: String,
      required: false,
      default: '确认你的交易',
    },
    width: {
      type: String,
      required: false,
      default: '480px',
    },
    canClose: {
      type: Boolean,
      required: false,
      default: true,
    },
  },
  methods: {
    close() {
      this.$emit('close');
    },
    confirm() {
      if (!this.submitting) {
        this.$emit('confirm');
      }
    },
  },
  watch: {
    show(val, oldVal) {
      this.$nextTick(() => {
        if (this.$refs.autofocus && val) {
          this.$refs.autofocus.focus();
        }
      });
    },
  },
};
</script>

<style scoped>
.modal-body {
  font-size: 14px;
  color: #bec2d1;
}
.modal-title {
  color: #eff0f7;
  flex: 1;
}
.modal-header {
  display: flex;
}
.button.is-text {
  text-decoration: none;
}
</style>
