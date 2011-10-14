Ext.define('App.store.ActivityStreamStore', {
    extend: 'Ext.data.Store',
    model: 'App.model.ActivityStreamModel',

    autoLoad: true,

    proxy: {
        type: 'ajax',
        url: 'app/data/ActivityStream.json',
        reader: {
            type: 'json',
            root: 'activitystreams'
        }
    }
});