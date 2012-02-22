Ext.define('Admin.store.account.LocaleStore', {
    extend: 'Ext.data.Store',

    model: 'Admin.model.account.LocaleModel',

    pageSize: 50,
    autoLoad: true,

    proxy: {
        type: 'ajax',
        url: 'data/misc/locale/list',
        simpleSortMode: true,
        reader: {
            type: 'json',
            root: 'locales',
            totalProperty : 'total'
        }
    }
});