<template>
<div class="cover-page">

  <div class="cover-page__content">
      <CreateWalletForm v-bind:with_close="false" v-bind:title="$t('导入私钥')" v-bind:with_title="false" v-bind:with_random="false" v-bind:margin_top="2"></CreateWalletForm>
  </div>

  <a class="modal-close is-large cover-page-close" @click="close"></a>
</div>
</template>
<script>
import CreateWalletForm from '@/views/components/CreateWalletForm'
export default {
  data () {
      return {}
  },
  methods: {
    close () {
      this.$router.push({
        name: 'walletNew'
      });
    }
  },
  components: {
    CreateWalletForm
  }
}

</script>