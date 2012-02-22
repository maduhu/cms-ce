Ext.define( 'Admin.view.account.GridPanel', {
    extend: 'Ext.grid.Panel',
    alias : 'widget.accountGrid',

    requires: [
        'Lib.plugins.PersistentGridSelectionPlugin',
        'Lib.plugins.SlidingPagerPlugin'
    ],
    plugins: ['persistentGridSelection'],
    layout: 'fit',
    multiSelect: true,
    columnLines: true,
    frame: false,
    store: 'Admin.store.account.AccountStore',

    initComponent: function()
    {
        this.columns = [
            {
                text: 'Display Name',
                dataIndex: 'displayName',
                sortable: true,
                renderer: this.nameRenderer,
                flex: 1
            },
            {
                text: 'Username',
                dataIndex: 'name',
                hidden: true,
                sortable: true
            },
            {
                text: 'Userstore',
                dataIndex: 'userStore',
                hidden: true,
                sortable: true
            },
            {
                text: 'E-Mail',
                dataIndex: 'email',
                hidden: true,
                sortable: true
            },
            {
                text: 'Country',
                dataIndex: 'country',
                hidden: true,
                sortable: true
            },
            {
                text: 'Locale',
                dataIndex: 'locale',
                hidden: true,
                sortable: true
            },
            {
                text: 'Timezone',
                dataIndex: 'timezone',
                hidden: true,
                sortable: true
            },
            {
                text: 'Last Modified',
                dataIndex: 'lastModified',
                renderer: this.prettyDateRenderer,
                sortable: true
            }
        ];

        this.tbar = {
            xtype: 'pagingtoolbar',
            store: this.store,
            plugins: ['slidingPagerPlugin']
        };

        this.viewConfig = {
            trackOver : true,
            stripeRows: true,
            loadMask: true
        };

        this.selModel = Ext.create( 'Ext.selection.CheckboxModel', {
            //checkOnly: true
        } );

        this.callParent( arguments );
    },

    nameRenderer: function( value, p, record )
    {
        var account = record.data;
        var photoUrl;
        if ( account.hasPhoto )
        {
            photoUrl = Ext.String.format( 'data/user/photo?key={0}&thumb=true', account.key );
        }
        else
        {
            photoUrl = !account.builtIn && account.type === 'user' ? 'resources/images/icons/256x256/dummy-user.png' :
                    account.builtIn ? 'resources/images/icons/256x256/masks.png'  : 'resources/images/icons/256x256/group.png';
        }
        return Ext.String.format( Templates.account.gridPanelNameRenderer, photoUrl, value, account.name, account.userStore );
    },

    prettyDateRenderer: function( value, p, record )
    {
        try
        {
            if ( parent && Ext.isFunction( parent.humane_date ) )
            {
                return parent.humane_date( value );
            }
            else
            {
                return value;
            }
        }
        catch( e )
        {
            return value;
        }
    }
} );