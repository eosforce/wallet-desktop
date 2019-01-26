<style scoped>
  .keys_select_item{
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 12px;
    color: #fff;
    min-height: 60px;
    border-bottom: 1px solid #272727;
    padding-bottom: 20px;
    margin-bottom: 20px;
  }
  .keys_action_btn{
    min-width: 100px;
    display: flex;
    background: #209cee;
    color: #e2e1e1;
    text-align: center;
    justify-content: center;
    height: 36px;
    align-items: center;
    border-radius: 4px;
    font-size: 14px;
    margin-left: 30px;
  }
  .keys_action_btn:hover{
    background-color: #3273dc;
  }
  .keys_item_t1{
    font-size: 16px;
  }
  .keys_item_des{
    color: #8c8c8e;
  }
</style>
<template>
  <div class="cover-page">

    <div class="cover-page__content">

      <!--  -->
      <div class="keys_select">

        <div class="keys_select_item">
          <div>
            <div class="keys_item_t1">{{ $t('创建新的私钥') }}</div>
            <div class="keys_item_des">{{ $t('如果你想创建一组可以在EOSForce使用的新的私钥, 可以使用此功能。该密钥是全新的，不会有任何资产') }}</div>
          </div>
          <router-link :to="{name: 'CreateKey'}" class="keys_action_btn">{{ $t('创建私钥') }}</router-link>
        </div>

        <div class="keys_select_item">
          <div>
            <div class="keys_item_t1">{{ $t('导入已有私钥') }}</div>
            <div class="keys_item_des">{{ $t('您已经有一个私钥，并希望导入钱包中') }}</div>
          </div>
          <!-- <a href="" class="keys_action_btn">导入私钥</a> -->
          <router-link :to="{name: 'ImportKey'}" class="keys_action_btn">{{ $t('导入私钥') }}</router-link>
        </div>

        <div class="keys_select_item">
          <div>
            <div class="keys_item_t1">{{ $t('导入钱包文件') }}</div>
            <div class="keys_item_des">{{ $t('如果有EOSForce钱包的导出文件，可以通过该功能导入') }}</div>
          </div>
          <router-link :to="{name: 'ImportWalletFile'}" class="keys_action_btn">{{ $t('导入钱包') }}</router-link>
        </div>
      </div>
      <!--  -->
      <div style="display: none">
        <Select v-bind:value="select_module.value" v-bind:select_list="select_module.select_list" v-on:input="select_module.value = $event"></Select>

        <CreateWalletForm v-bind:with_close="false" v-bind:with_title="false" v-bind:with_random="false" v-bind:margin_top="2" v-if="select_module.value == 0"></CreateWalletForm>
        <CreateWalletForm v-bind:with_close="false" v-bind:with_title="false" v-bind:with_random="true" v-bind:margin_top="2" v-if="select_module.value == 1"></CreateWalletForm>
        <ImportWalletForm v-bind:margin_top='2' v-if="select_module.value == 2"></ImportWalletForm>
      </div>
      <a class="modal-close is-large cover-page-close" @click="close"></a>
    </div>
  </div>
</template>

<script>
import Select from '@/views/components/select'
import CreateWalletForm from '@/views/components/CreateWalletForm'
import ImportWalletForm from '@/views/components/ImportWalletForm'
export default {
  name: 'WalletNew',
  data() {
    return {

      select_module: {
        select_list: [
          {value: 0, text: this.$t('导入已有私钥')},
          {value: 1, text: this.$t('创建新钱包')},
          {value: 2, text: this.$t('导入钱包文件')},
        ],
        value: 0
      }

    };
  },
  computed: {
    
  },
  methods: {
    close() {
      if (this.walletId) {
        this.$router.push({ name: 'walletDetail', params: { walletId: this.walletId } });
      } else {
        this.$router.push({ name: 'dashboard' });
      }
    },
  },
  components: {
    CreateWalletForm,
    ImportWalletForm,
    Select
  },
};
</script>
