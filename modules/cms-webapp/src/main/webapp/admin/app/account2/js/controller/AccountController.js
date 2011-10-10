Ext.define( 'App.controller.AccountController', {
    extend: 'Ext.app.Controller',

    stores: ['UserStore', 'UserstoreConfigStore', 'CountryStore', 'CallingCodeStore', 'LanguageStore',
        'RegionStore', 'GroupStore'],
    models: ['UserModel', 'UserFieldModel', 'UserstoreConfigModel', 'CountryModel', 'CallingCodeModel',
        'LanguageModel', 'RegionModel', 'GroupModel'],
    views: [
        'BrowseToolbar',
        'GridPanel',
        'ShowPanel',
        'DetailPanel',
        'FilterPanel',
        'DeleteWindow',
        'ChangePasswordWindow',
        'ContextMenu',
        'EditUserPanel',
        'NewUserPanel',
        'EditUserFormPanel',
        'UserFormField',
        'GroupItemField',
        'UserPreferencesPanel',
        'AddressPanel',
        'AddressContainer',
        'GroupDetailButton',
        'wizard.UserWizardToolbar',
        'wizard.UserWizardPanel',
        'wizard.UserStoreListPanel'
    ],

    init: function()
    {
        Ext.create('widget.accountContextMenu');
        Ext.create('widget.userChangePasswordWindow');

        this.control(
            {
                'cmsTabPanel': {
                    afterrender: function(tabPanel, eOpts) {
                        //this.createBrowseTab(tabPanel, eOpts);
                        //this.updateActionItems();
                    }
                },
                '*[action=newUser]': {
                    click: this.showEditUserForm
                },
                '*[action=saveUser]': {
                    click: this.saveUser
                },
                '*[action=newGroup]': {
                    click: this.createNewGroupTab
                },
                '*[action=toggleDisplayNameField]': {
                    click: this.toggleDisplayNameField
                },
                'editUserPanel #iso-country' : {
                    select: this.countryChangeHandler
                },
                'accountGrid': {
                    selectionchange: function() {
                        this.updateDetailsPanel();
                        this.updateActionItems();
                    },
                    beforeitemmousedown: this.cancelItemContextClickOnMultipleSelection,
                    itemcontextmenu: this.popupMenu,
                    itemdblclick: this.showEditUserForm
                },
                'userFilter': {
                    specialkey: this.filterHandleEnterKey,
                    render: this.onFilterPanelRender
                },
                'accountFilter button[action=search]': {
                    click: this.searchFilter
                },
                '*[action=showDeleteWindow]': {
                    click: this.showDeleteUserWindow
                },
                '*[action=deleteUser]': {
                    click: this.deleteUser
                },
                '*[action=addNewTab]': {
                    click: this.addNewTab
                },
                '*[action=deselectItem]': {
                    click: this.deselectItem
                },
                '*[action=edit]': {
                    click: this.showEditUserForm
                },
                '*[action=changePassword]': {
                    click: this.showChangePasswordWindow
                },
                'accountDetail': {
                    render: this.initDetailToolbar
                },
                'editUserPanel textfield[name=prefix]': {
                    keyup: this.textFieldHandleEnterKey
                },
                'editUserPanel textfield[name=first-name]': {
                    keyup: this.textFieldHandleEnterKey
                },
                'editUserPanel textfield[name=middle-name]': {
                    keyup: this.textFieldHandleEnterKey
                },
                'editUserPanel textfield[name=last-name]': {
                    keyup: this.textFieldHandleEnterKey
                },
                'editUserPanel textfield[name=suffix]': {
                    keyup: this.textFieldHandleEnterKey
                },
                'editUserPanel textfield[name=label]': {
                    keyup: this.updateTabTitle
                },
                '*[action=deleteGroup]': {
                    click: this.leaveGroup
                },
                '*[action=selectGroup]': {
                    select: this.selectGroup
                },
                '*[action=closeMembershipWindow]': {
                    click: this.closeMembershipWindow
                },
                '*[action=closeUserForm]': {
                    click: this.closeUserForm
                },
                '*[action=initValue]': {
                    added: this.initValue
                }
            }
        );
    },

    onFilterPanelRender: function()
    {
        Ext.getCmp( 'filter' ).focus( false, 10 );
    },

    createBrowseTab: function( tabPanel, eOpts )
    {
        this.getCmsTabPanel().addTab( {
           id: 'tab-browse',
           title: 'Browse',
           closable: false,
           xtype: 'panel',
           layout: 'border',
           dockedItems: [
               {
                   xtype: 'browseToolbar',
                   dock: 'top'
               }],
           items: [
               {
                   region: 'west',
                   width: 225,
                   xtype: 'accountFilter'
               },
               {
                   region: 'center',
                   xtype: 'accountShow'
               }
           ]
        } );

        var accountDetail = this.getAccountDetailPanel();
        accountDetail.updateTitle(this.getPersistentGridSelectionPlugin());
    },

    createNewGroupTab: function()
    {
        this.getCmsTabPanel().addTab(
            {
                title: 'New Group',
                html: 'New Group Form',
                iconCls: 'icon-group-add'
            }
        );
    },

    showDeleteUserWindow: function()
    {
        Ext.create('widget.userDeleteWindow');
        this.getUserDeleteWindow().doShow( this.getPersistentGridSelectionPlugin() );
    },

    showChangePasswordWindow: function()
    {
        Ext.create('widget.userChangePasswordWindow');
        this.getUserChangePasswordWindow().doShow( this.getSelectedGridItem() );
    },

    updateDetailsPanel: function()
    {
        var persistentGridSelection = this.getPersistentGridSelectionPlugin();
        var selection = persistentGridSelection.getSelection();
        var accountDetailPanel = this.getAccountDetailPanel();
        var selectionCount = persistentGridSelection.getSelectionCount();
        var userStore = this.getStore('UserStore');
        var pageSize = userStore.pageSize;
        var totalCount = userStore.totalCount;

        if ( selectionCount == 0 )
        {
            accountDetailPanel.showNoneSelection();
        }
        else if ( selectionCount >= pageSize )
        {
            accountDetailPanel.showAllSelected(
                {
                    pageSize: pageSize,
                    totalCount: totalCount
                }
            );
        }
        else
        {
            var user = selection[0];
            if ( user )
            {
                accountDetailPanel.setCurrentUser( user.data );
            }

            var detailed = true;
            if ( selectionCount > 10 )
            {
                detailed = false;
            }
            var selectedUsers = [];
            Ext.Array.each( selection, function( user )
            {
                Ext.Array.include( selectedUsers, user.data );
            } );
            accountDetailPanel.showMultipleSelection( selectedUsers, detailed );
        }

        accountDetailPanel.updateTitle(persistentGridSelection);
    },

    updateActionItems: function()
    {
        var components2d = [];
        components2d.push( Ext.ComponentQuery.query( '*[action=edit]' ) );
        components2d.push( Ext.ComponentQuery.query( '*[action=showDeleteWindow]' ) );
        components2d.push( Ext.ComponentQuery.query( '*[action=changePassword]' ) );

        var items = [];
        var selectionCount = this.getPersistentGridSelectionPlugin().getSelectionCount();
        var multipleSelection = selectionCount > 1;
        var disable = selectionCount === 0;

        for ( var i = 0; i < components2d.length; i++ )
        {
            items = components2d[i];
            for (var j = 0; j < items.length; j++)
            {
                items[j].setDisabled(disable);
                if ( multipleSelection && items[j].disableOnMultipleSelection )
                {
                    items[j].setDisabled(true);
                }
            }
        }
    },

    searchFilter: function()
    {
        var usersStore = this.getUserStoreStore();
        var textField = this.getFilterTextField();

        usersStore.clearFilter();
        usersStore.load( {params:{query: textField.getValue()}} );
    },

    filterHandleEnterKey: function( field, event )
    {
        if ( event.getKey() == event.ENTER )
        {
            this.searchFilter();
        }
    },

    popupMenu: function( view, rec, node, index, e )
    {
        e.stopEvent();
        this.getUserContextMenu().showAt( e.getXY() );
        return false;
    },

    deleteUser: function()
    {
        var deleteUserWindow = this.getUserDeleteWindow();
        Ext.Ajax.request(
            {
                url: 'data/user/delete',
                method: 'POST',
                params: {userKey: deleteUserWindow.userKey},
                success: function( response, opts )
                {
                    deleteUserWindow.close();
                    Ext.Msg.alert( 'Info', 'User was deleted' );
                },
                failure: function( response, opts )
                {
                    Ext.Msg.alert( 'Info', 'User wasn\'t deleted' );
                }
            }
        );
    },

    showEditUserForm: function( el, e )
    {
        if ( el.action == 'newUser' )
        {
            var tab = {
                id: Ext.id(null, 'new-user-'),
                title: 'New User',
                iconCls: 'icon-user-add',
                closable: true,
                autoScroll: true,
                layout: 'fit',
                items: [
                    {
                        xtype: 'userWizardPanel'
                    }
                ]
            };
            this.getCmsTabPanel().addTab( tab );
        }
        else
        {
            var accountDetail = this.getAccountDetailPanel();
            var tabPane = this.getCmsTabPanel();
            var currentUser = accountDetail.getCurrentUser();
            Ext.Ajax.request(
                {
                    url: 'data/user/userinfo',
                    method: 'GET',
                    params: {key: currentUser.key},
                    success: function( response )
                    {
                        var jsonObj = Ext.JSON.decode( response.responseText );
                        var tab = {
                            id: currentUser.userStore + '-' + currentUser.name,
                            layout: 'border',
                            title: currentUser.displayName + ' (' + currentUser.qualifiedName + ')',
                            iconCls: 'icon-edit-user',
                            closable: true,
                            autoScroll: true,
                            items: [
                                {
                                    xtype: 'editUserPanel',
                                    region: 'center',
                                    userFields: jsonObj,
                                    currentUser: currentUser
                                }
                            ]
                        };
                        tabPane.addTab( tab );
                    }
                }
            );

        }
    },

    initDetailToolbar: function()
    {
        var accountDetail = this.getAccountDetailPanel();
        accountDetail.showNoneSelection();
    },

    countryChangeHandler: function( field, newValue, oldValue, options )
    {
        var region = field.up( 'addressPanel' ).down( '#iso-region' );
        if ( region )
        {
            region.clearValue();
            Ext.apply( region.store.proxy.extraParams, {
                'countryCode': field.getValue()
            });

            region.store.load(
                {
                    callback: function( records, operation, success )
                    {
                        region.setDisabled( !records || records.length == 0 );
                    }
                }
            );
}
        return true;
    },

    textFieldHandleEnterKey: function( field, event )
    {
        var formPanel = field.up( 'editUserPanel' );
        var prefix = formPanel.down( '#prefix' ) ? Ext.String.trim( formPanel.down( '#prefix' ).getValue() ) : '';
        var firstName = formPanel.down( '#first-name' ) ? Ext.String.trim( formPanel.down( '#first-name' ).getValue() )
                : '';
        var middleName = formPanel.down( '#middle-name' )
                ? Ext.String.trim( formPanel.down( '#middle-name' ).getValue() ) : '';
        var lastName = formPanel.down( '#last-name' ) ? Ext.String.trim( formPanel.down( '#last-name' ).getValue() )
                : '';
        var suffix = formPanel.down( '#suffix' ) ? Ext.String.trim( formPanel.down( '#suffix' ).getValue() ) : '';
        var displayName = Ext.get('display-name');
        if ( displayName )
        {
            var displayNameValue = prefix + ' ' + firstName + ' ' + middleName + ' ' + lastName + ' ' + suffix;
            displayName.dom.value = Ext.String.trim( displayNameValue );
        }
    },

    getSelectedGridItem: function()
    {
        return this.getUserGrid().getSelectionModel().selected.get( 0 );
    },

    cancelItemContextClickOnMultipleSelection: function( view, record, item, index, event, eOpts )
    {
        var persistentGridSelection = this.getPersistentGridSelectionPlugin();
        var rightClick = event.button === 2;
        var isSelected = persistentGridSelection.selected[record.internalId];

        var cancel = rightClick && isSelected && persistentGridSelection.getSelectionCount() > 1;
        if ( cancel )
        {
            return false;
        }

        return true;
    },

    addNewTab: function( button, event )
    {
        var tabPanel = button.up( '#addressContainer' );
        var newTab = this.getEditUserFormPanel().generateAddressPanel( tabPanel.sourceField, true );
        newTab = tabPanel.insert( 0 , newTab );
    },

    updateTabTitle: function ( field, event )
    {
        var addressPanel = field.up( 'addressPanel' );
        addressPanel.setTitle( field.getValue() );
    },

    toggleDisplayNameField: function ( button, event )
    {
        var tabId = button.currentUser != '' ? button.currentUser.userStore + '-' + button.currentUser.name
                : 'new-user';
        var locked = 'icon-locked';
        var open = 'icon-unlocked';
        var displayNameField = this.getCmsTabPanel().down( '#' + tabId ).down( '#display-name' );
        if ( button.iconCls == locked )
        {
            button.setIconCls( open );
            displayNameField.setReadOnly( false );
        }
        else
        {
            button.setIconCls( locked );
            displayNameField.setReadOnly( true );
        }

    },

    selectGroup: function( field, value, options )
    {
        var userPrefPanel = field.up( 'userPreferencesPanel' );
        var groupPanel = userPrefPanel.down( '#groupPanel' );
        var userPanel = field.up( 'editUserPanel' );
        var groupItem = {
            xtype: 'groupDetailButton',
            value: value[0].get( 'name' ),
            key: value[0].get( 'key' )
        };

        var isContain = Ext.Array.contains( groupPanel.groupKeys, value[0].get( 'key' ) );
        if ( !isContain )
        {
            Ext.Ajax.request(
                {
                    url: 'data/group/join',
                    method: 'POST',
                    params: {key: userPanel.currentUser.key, isUser: true, join: [groupItem.key]},
                    success: function( response, opts )
                    {
                        groupPanel.add( groupItem );
                    },
                    failure: function( response, opts )
                    {
                        Ext.Msg.alert( 'Info', 'Group wasn\'t added' );
                    }
                }
            );
        }
        else
        {
            Ext.Msg.alert( 'Info', 'Group was already added' );
        }

        field.setValue( '' );
    },

    leaveGroup: function( element, event )
    {
        var groupItem = element.up( 'groupDetailButton' );
        var groupPanel = element.up( '#groupPanel' );
        var userPanel = element.up( 'editUserPanel' );
        Ext.Ajax.request(
            {
                url: 'data/group/leave',
                method: 'POST',
                params: {key: userPanel.currentUser.key, isUser: true, leave: [groupItem.key]},
                success: function( response, opts )
                {
                    groupPanel.removeItem( groupItem );
                },
                failure: function( response, opts )
                {
                    Ext.Msg.alert( 'Info', 'Group wasn\'t removed' );
                }
            }
        );
    },

    saveUser: function( button )
    {
        var editUserForm = button.up( 'editUserPanel' );
        if ( editUserForm.getForm().isValid() )
        {
            var formValues = editUserForm.getValues();
            var userData = {
                username: formValues['username'],
                'display-name': Ext.get('display-name').dom.value,
                email: formValues['email'],
                key: editUserForm.userFields.key,
                userStore: editUserForm.userFields.userStore ? editUserForm.userFields.userStore
                        : editUserForm.defaultUserStoreName,
                userInfo: formValues
            };
            var tabPanel = editUserForm.down( '#addressContainer' );
            var tabs = tabPanel.query( 'form' );
            var addresses = [];
            for ( var index in tabs )
            {
                var address = tabs[index].getValues();
                Ext.Array.include( addresses, address );
            }
            userData.userInfo.addresses = addresses;

            Ext.Ajax.request(
                {
                    url: 'data/user/update',
                    method: 'POST',
                    jsonData: userData,
                    success: function( response, opts )
                    {
                        var serverResponse = Ext.JSON.decode( response.responseText );
                        if ( !serverResponse.success )
                        {
                            Ext.Msg.alert( 'Error', serverResponse.error );
                        }
                        else
                        {
                            Ext.Msg.alert( 'Info', 'User was updated' );
                        }
                    },
                    failure: function( response, opts )
                    {
                        Ext.Msg.alert( 'Error', 'Internal server error was occured' );
                    }
                }
            );
        }
        else
        {
            Ext.Msg.alert( 'Error', 'Some required fields are missing' );
        }
    },

    closeUserForm: function( button )
    {
        var tabPane = this.getCmsTabPanel();
        tabPane.getActiveTab().close();
    },

    initValue: function( field )
    {
        var formField = field.up( 'userFormField' );
        field.valueNotFoundText = formField.fieldValue;
        field.setValue( formField.fieldValue );
    },

    deselectItem: function( button )
    {
        var selModel = this.getUserGrid().getSelectionModel();
        var userInfoPanel = button.up( 'userDetailButton' );
        if ( userInfoPanel == null )
        {
            userInfoPanel = button.up( 'userShortDetailButton' );
        }

        selModel.deselect( userInfoPanel.getUser() );
    },

    getPersistentGridSelectionPlugin: function()
    {
        return this.getUserGrid().getPlugin('persistentGridSelection');
    },

    getCmsTabPanel: function()
    {
        return Ext.ComponentQuery.query( 'cmsTabPanel' )[0];
    },

    getUserGrid: function()
    {
        return Ext.ComponentQuery.query( 'accountGrid' )[0];
    },

    getAccountDetailPanel: function()
    {
        return Ext.ComponentQuery.query( 'accountDetail' )[0];
    },

    getFilterTextField: function()
    {
        return Ext.ComponentQuery.query( 'accountFilter textfield[name=filter]' )[0];
    },

    getEditUserFormPanel: function()
    {
        return Ext.ComponentQuery.query( 'editUserFormPanel' )[0];
    },

    getUserDeleteWindow: function()
    {
        return Ext.ComponentQuery.query( 'userDeleteWindow' )[0];
    },

    getUserChangePasswordWindow: function()
    {
        return Ext.ComponentQuery.query( 'userChangePasswordWindow' )[0];
    },

    getUserContextMenu: function()
    {
        return Ext.ComponentQuery.query( 'accountContextMenu' )[0];
    }

} );