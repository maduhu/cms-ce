Ext.define( 'App.store.AccountStore', {
    extend: 'Ext.data.Store',

    model: 'Cms.model.account.AccountModel',

    pageSize: 50,
    remoteSort: true,
    sorters: [{
        property: 'lastModified',
        direction: 'DESC'
    }],
    //buffered: true,
    autoLoad: true,

    proxy: {
        type: 'ajax',
        url: 'data/account/search',
        simpleSortMode: true,
        reader: {
            type: 'json',
            root: 'results.accounts',
            totalProperty : 'results.total'
        }
    }
} );