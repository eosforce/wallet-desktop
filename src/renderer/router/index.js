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
        {
          name: 'walletDetail',
          path: 'wallets/:walletId',
          component: () => import('@/views/wallet/WalletDetail'),
          children: [
            {
              name: 'accountNew',
              path: 'accounts/new',
              components: {
                modal: () => import('@/views/account/AccountNew'),
              },
            },
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
                  name: 'transfer',
                  path: 'transfer',
                  components: {
                    modal: () => import('@/views/account/Transfer'),
                  },
                },
                {
                  name: 'tokenTransfer',
                  path: ':symbol/transfer',
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
