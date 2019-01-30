import { Mutations, Actions, Getters } from '@/constants/types.constants';
import {
    getAccountInfo,
    transfer,
    getAvailable,
    getTransferRecord,
    vote,
    delegatebw,
    unfreeze,
    claim,
    vote4ram,
    unfreeze4ram,
    getTokenList,
    transfer_account,
    getAccount,
    getRewardsAndBpsTable,
    getGlobalTable,
    count_asset_total,
    getTransAction,
    getBlock,
    create_token,
    issue_token,
    rank_get_action,
    getLockedEosc,
    getFreeze,
    freeze,
    getBpsTable,
    getVotesTable,
    getVotes4ramTable,
    get_super_bps_table
} from '@/services/Eos';

export default {
    state: {

        // @todo
        node_info: {
          data: null,
          is_error: false,
          on_load: true,
          load_key: ''
        },
        account_info: {
          data: null,
          is_error: false,
          on_load: false,
          load_key: ''
        },
        available: {
          data: null,
          is_error: false,
          on_load: false,
          load_key: ''
        },
        // getBpsTable
        votes_table: {
          data: null,
          is_error: false,
          on_load: false,
          load_key: ''
        },
        votes4ram_table: {
          data: null,
          is_error: false,
          on_load: false,
          load_key: ''
        },
        bps_table: {
          data: null,
          is_error: false,
          on_load: false,
          load_key: ''
        },
        super_bps_table: {
          data: null,
          is_error: false,
          on_load: false,
          load_key: ''
        },
        locked_eosc: {
          data: null,
          is_error: false,
          on_load: false,
          load_key: ''
        },
        vote_and_voteram_freeze: {
          data: null,
          is_error: false,
          on_load: false,
          load_key: ''
        },
    },
    mutations: {
      set_load_status (state, {key = null, status = null, load_key = ''}) {
        if(!key) return ;
        state[key]['on_load'] = status;
        state[key]['load_key'] = load_key;
      },
      set_data (state, {key = null, data = null}) {
        if(!key) return;
        state[key]['data'] = data;
      }
    },
    actions: {
        async get_account_info ({ state, dispatch, commit, getters }, filter_way = 'EOSC') {

          const account_name = getters[Getters.CURRENT_ACCOUNT_NAME],
                node_url = getters[Getters.CURRENT_NODE],
                _key = 'account_info';

          if(state[_key]['on_load'] && state[_key]['load_key'] == account_name){
            return ;
          }

          commit('set_load_status', {key: _key, status: true, load_key: account_name });
          
          let result = await getAccount(node_url)(account_name, account_name);
          if (account_name != state[_key]['load_key']) {
              return;
          }

          commit('set_load_status', {key: _key, status: false});
          commit('set_data', {key: _key, data: result[0]});

        },
        async get_available ({ state, dispatch, commit, getters }, filter_way = 'EOSC') {

          const account_name = getters[Getters.CURRENT_ACCOUNT_NAME],
                node_url = getters[Getters.CURRENT_NODE],
                _key = 'available';

          if(state[_key]['on_load'] && state[_key]['load_key'] == account_name){
            return ;
          }

          commit('set_load_status', {key: _key, status: true, load_key: account_name });
          let result = await getAvailable(node_url)(account_name, getters['core_coin_contract'], account_name);

          if (account_name != state[_key]['load_key']) {
              return;
          }
          commit('set_load_status', {key: _key, status: false});
          commit('set_data', {key: _key, data: result[0]});

        },

        async get_bps_table ({state, dispatch, commit, getters}) {

          const account_name = getters[Getters.CURRENT_ACCOUNT_NAME],
                node_url = getters[Getters.CURRENT_NODE],
                _key = 'bps_table';

          if(state[_key]['on_load'] && state[_key]['load_key'] == account_name){
            return ;
          }

          commit('set_load_status', {key: _key, status: true, load_key: account_name });
          let result = await getBpsTable(node_url)(account_name);

          if (account_name != state[_key]['load_key']) {
              return;
          }
          commit('set_load_status', {key: _key, status: false});
          commit('set_data', {key: _key, data: result[0]});

        },

        async get_votes_table ({state, dispatch, commit, getters}) {

          const account_name = getters[Getters.CURRENT_ACCOUNT_NAME],
                node_url = getters[Getters.CURRENT_NODE],
                _key = 'votes_table';

          if(state[_key]['on_load'] && state[_key]['load_key'] == account_name){
            return ;
          }

          commit('set_load_status', {key: _key, status: true, load_key: account_name });

          let result = await getVotesTable(node_url)(account_name, '', account_name);
          if (account_name != state[_key]['load_key']) {
              return;
          }
          console.log(result[0], new Date().getTime());

          commit('set_load_status', {key: _key, status: false});
          commit('set_data', {key: _key, data: result[0]});

        },

        async get_locked_eosc ({state, dispatch, commit, getters}) {
          const account_name = getters[Getters.CURRENT_ACCOUNT_NAME],
                node_url = getters[Getters.CURRENT_NODE],
                _key = 'locked_eosc';

          if(state[_key]['on_load'] && state[_key]['load_key'] == account_name){
            return ;
          }

          commit('set_load_status', {key: _key, status: true, load_key: account_name });

          let result = await getLockedEosc(node_url)(account_name, account_name);
          if (account_name != state[_key]['load_key']) {
              return;
          }

          commit('set_load_status', {key: _key, status: false});
          commit('set_data', {key: _key, data: result[0]});
        },

        async votes4ram_table ({state, dispatch, commit, getters}) {
          const account_name = getters[Getters.CURRENT_ACCOUNT_NAME],
                node_url = getters[Getters.CURRENT_NODE],
                _key = 'locked_eosc';

          if(state[_key]['on_load'] && state[_key]['load_key'] == account_name){
            return ;
          }

          commit('set_load_status', {key: _key, status: true, load_key: account_name });

          let result = await getVotes4ramTable(node_url)(account_name, account_name);
          if (account_name != state[_key]['load_key']) {
              return;
          }

          commit('set_load_status', {key: _key, status: false});
          commit('set_data', {key: _key, data: result[0]});
        },

        async super_bps_table ({state, dispatch, commit, getters}) {
          const account_name = getters[Getters.CURRENT_ACCOUNT_NAME],
                node_url = getters[Getters.CURRENT_NODE],
                _key = 'super_bps_table';

          if(state[_key]['on_load'] && state[_key]['load_key'] == account_name){
            return ;
          }

          const node_info = getters[Getters.CURRENT_NODE_INFO],
                schedule_version = node_info.block.schedule_version;

          commit('set_load_status', {key: _key, status: true, load_key: account_name });

          let result = await get_super_bps_table(node_url)(schedule_version, account_name);
          if (account_name != state[_key]['load_key']) {
              return;
          }

          commit('set_load_status', {key: _key, status: false});
          commit('set_data', {key: _key, data: result[0]});
        },

        async get_all_bps_table_and_votes_table ({state, dispatch, commit, getters}) {
          const account_name = getters[Getters.CURRENT_ACCOUNT_NAME],
                node_url = getters[Getters.CURRENT_NODE],
                keys = {'bps_table': 'bps_table', 'votes_table': 'votes_table', 'super_bps_table': 'super_bps_table'};

          if(state['bps_table']['on_load'] && state['bps_table']['load_key'] == account_name){
            return ;
          }

          const node_info = getters[Getters.CURRENT_NODE_INFO],
                schedule_version = node_info.block.schedule_version;

          let super_bps_table = get_super_bps_table(node_url)(schedule_version, account_name),
              bps_table = getBpsTable(node_url)(account_name),
              votes_table = getVotesTable(node_url)(account_name, '', account_name);

          super_bps_table = await super_bps_table,
          bps_table = await super_bps_table,
          votes_table = await votes_table;

          if (account_name != state['bps_table']['load_key']) {
              return;
          }
          // 

          // 

          commit('set_load_status', {key: keys['bps_table'], status: false});
          commit('set_load_status', {key: keys['votes_table'], status: false});
          commit('set_load_status', {key: keys['super_bps_table'], status: false});

          commit('set_data', {key: keys['bps_table'], data: bps_table[0]});
          commit('set_data', {key: keys['votes_table'], data: votes_table[0]});
          commit('set_data', {key: keys['super_bps_table'], data: super_bps_table[0]});

        },

        async load_overview ({ state, dispatch, commit, getters }, key) {
          await dispatch('votes4ram_table');

          // await dispatch('super_bps_table');
          // await dispatch('get_bps_table');
          // await dispatch('get_votes_table');
          await dispatch('get_all_bps_table_and_votes_table');

          await dispatch('get_account_info');

          await Promise.all[dispatch('get_available'), dispatch('get_locked_eosc')];
       }
    }
}


















