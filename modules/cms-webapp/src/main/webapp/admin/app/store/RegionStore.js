Ext.define('CMS.store.RegionStore', {
    extend: 'Ext.data.Store',

    model: 'CMS.model.RegionModel',

    //pageSize: 100,
    autoLoad: false,

    proxy: {
        type: 'ajax',
        url: 'data/misc/region/list',
        //url: 'app/data/Regions.json',
        reader: {
            type: 'json',
            root: 'regions',
            totalProperty : 'total'
        }
    }
});