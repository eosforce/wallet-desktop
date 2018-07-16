<template>
  <div class="modal modal-sm basic-modal is-active" v-if="isShow">
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
        <a tabindex="-1" v-if="canClose" class="button cancel-button" :disabled="submitting" @click="close">{{$t('取消')}}</a>
        <a class="button is-link" :class="{'is-loading': submitting}" :disabled="submitting" @click="confirm">{{$t('确定')}}</a>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PromptModal',
  data() {
    return {
      resolve: null,
      reject: null,
      isShow: false,
    };
  },
  props: {
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
      default: '提示',
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
    show() {
      return new Promise((resolve, reject) => {
        this.resolve = resolve;
        this.reject = reject;
        this.isShow = true;
      });
    },
    close() {
      const reject = () => {
        this.isShow = false;
        this.reject();
      };
      this.$emit('close', reject);
    },
    confirm() {
      if (!this.submitting) {
        const resolve = () => {
          this.isShow = false;
          this.resolve();
        };
        this.$emit('confirm', resolve);
      }
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
