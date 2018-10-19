<template>
  <div class="cover-page">

    <div class="cover-page__content">
      <form class="cover-page__form" @submit.prevent="!submitting && save_node_list_config()">

        <div>
          <textarea class="node_config_area" v-model="node_list"></textarea>
        </div>

        <div class="field is-grouped is-grouped-right">
          <div class="control">
            <a tabindex="-1" class="button cancel-button" :disabled="submitting" @click="!submitting && close()">{{$t('取消')}}</a>
          </div>
          <div class="control">
            <button type="submit" class="button is-link" :class="{'is-loading': submitting}" :disabled="submitting">{{$t('保存')}}</button>
          </div>
        </div>

      </form>
    </div>


  </div>
</template>

<script>
import { mapActions } from 'vuex';

import Message from '@/components/Message';
import ConfirmModal from '@/components/ConfirmModal';
import PromptModal from '@/components/PromptModal';
import { Actions } from '@/constants/types.constants';
import { decryptWif } from '@/utils/util';
import fs from 'fs';
import path from 'path';

export default {
  name: 'WalletImport',
  data() {
    return {
      privateKey: '',
      password: '',
      isSubmited: false,
      isAgreeTerm: false,
      submitting: false,

      isValidPassword: true,

      walletData: '',
      walletFilePath: '',

      confirmMsg: '',
      walletId: '',
      showConfirm: false,
      accountsList: [],
      node_list: ''
    };
  },
  mounted () {
    this.get_stored_node_list();
  },
  methods: {
    async get_stored_node_list () {
      let node_list = await this.GET_STORE_NODE_LIST();
      this.node_list = JSON.stringify(node_list);
    },
    save_node_list_config () {
      let edited_node_list = null;
      try {
          edited_node_list = JSON.parse( this.node_list );
      }catch(__){
          Message.error(this.$t(__));
          return ;
      }
      this.UPDATE_NODE_LIST({ node_list: edited_node_list });
    },
    submit() {
      
    },
    close() {
      if (this.walletId) {
        this.$router.push({ name: 'walletDetail', params: { walletId: this.walletId } });
      } else {
        this.$router.push({ name: 'dashboard' });
      }
    },
    ...mapActions({
      newWallet: Actions.NEW_WALLET,
      fetchAccountList: Actions.FETCH_ACCOUNT_LIST,
      GET_STORE_NODE_LIST: Actions.GET_STORE_NODE_LIST,
      UPDATE_NODE_LIST: Actions.UPDATE_NODE_LIST
    }),
  },
  components: {
    ConfirmModal,
    PromptModal,
  },
};
</script>
<style scoped>
.link-button {
  font-size: 12px;
}
.file-path {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  color: rgb(255, 255, 255);
  font-size: 12px;
}
.cover-page{
  position: fixed;
  top: 0px;
  background-color: rgba(0, 0, 0, 0.35);
}
.node_config_area{
    width: 100%;
    border-radius: 4px;
    height: 400px;
    padding: 20px;
}
</style>