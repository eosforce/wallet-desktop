<template>
<div class="cover-page">

  <div class="cover-page__content">
      <ImportWalletForm v-bind:with_close="false" v-bind:with_title="false" v-bind:with_random="true" v-bind:margin_top="2"></ImportWalletForm>
  </div>

  <a class="modal-close is-large cover-page-close" @click="close"></a>
</div>
</template>
<script>
import ImportWalletForm from '@/views/components/ImportWalletForm'
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
    ImportWalletForm
  }
}

</script>