import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);

const pageHeader = () => import('@/views/layout/PageHeader');

export default new Router({
  routes: [
    {
      path: '/',
      name: 'dashboard',
      components: {
        header: pageHeader,
        default: () => import('@/views/wallet/Dashboard'),
      },
      children: [
        // {
        //   path: '/config_node_list',
        //   name: 'config_node_list',
        //   components: {
        //     default: () => import('@/views/wallet/config_node_list'),
        //   },
        // },
        {
          name: 'walletDetail',
          path: 'wallets/:walletId',
          component: () => import('@/views/wallet/WalletDetail'),
          children: [
            {
              name: 'accountDetail',
              path: 'accounts/:accountName',
              component: () => import('@/views/account/AccountDetail'),
              children: [
                {
                  name: 'accountCreateAccount',
                  path: 'new',
                  components: {
                    modal: () => import('@/views/account/AccountNew'),
                  },
                },
                {
                  name: 'accountTransfer',
                  path: 'accountTransfer',
                  components: {
                    modal: () => import('@/views/account/AccountTransfer'),
                  },
                },
                {
                  name: 'NetCpu',
                  path: 'NetCpu',
                  components: {
                    modal: () => import('@/views/account/NetCpu'),
                  },
                },
                {
                  name: 'transfer',
                  path: 'transfer',
                  components: {
                    modal: () => import('@/views/account/Transfer'),
                  },
                },
                {
                  name: 'tokenTransfer',
                  path: ':symbol/transfer?precision',
                  components: {
                    modal: () => import('@/views/account/Transfer'),
                  },
                },
                {
                  name: 'vote',
                  path: ':bpname/vote',
                  components: {
                    modal: () => import('@/views/account/Vote'),
                  },
                },
                {
                  name: 'unfreeze',
                  path: ':bpname/unfreeze',
                  components: {
                    modal: () => import('@/views/account/Unfreeze'),
                  },
                },
                {
                  name: 'claim',
                  path: ':bpname/claim',
                  components: {
                    modal: () => import('@/views/account/Claim'),
                  },
                },
                {
                    name: 'vote4ram',
                    path: ':bpname/vote4ram',
                    components: {
                      modal: () => import('@/views/account/Vote4ram'),
                    },
                },
                {
                    name: 'Unfreeze4ram',
                    path: ':bpname/Unfreeze4ram',
                    components: {
                      modal: () => import('@/views/account/Unfreeze4ram'),
                    },
                },
              ],
            },
          ],
        },
      ],
    },
    {
      path: '/entry',
      name: 'entry',
      components: {
        default: () => import('@/views/entry/Entry'),
      },
    },
    {
      path: '/wallet-new',
      name: 'walletNew',
      components: {
        default: () => import('@/views/wallet/WalletNew'),
      },
    },
    {
      path: '/wallet-import',
      name: 'walletImport',
      components: {
        default: () => import('@/views/wallet/WalletImport'),
      },
    },
    {
      path: '*',
      redirect: '/',
    },
  ],
});
