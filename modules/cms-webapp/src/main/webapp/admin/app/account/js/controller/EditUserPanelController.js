Ext.define( 'App.controller.EditUserPanelController', {
    extend: 'Ext.app.Controller',

    stores: [],
    models: [],
    views: [
        'SelectUserStoreWindow'
    ],

    init: function()
    {
        this.control(
            {

                '*[action=saveUser]': {
                    click: this.saveUser
                },
                '*[action=toggleDisplayNameField]': {
                    click: this.toggleDisplayNameField
                },
                'addressPanel #iso-country' : {
                    select: this.countryChangeHandler
                },
                '*[action=deleteAccount]': {
                    click: this.deleteAccount
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
                '*[action=closeUserForm]': {
                    click: this.closeUserForm
                },
                '*[action=addNewTab]': {
                    click: this.addNewTab
                },
                '*[action=initValue]': {
                    added: this.initValue
                }
            }
        );
    },

    deleteAccount: function( button )
    {
        var deleteAccountWindow = button.up( 'deleteAccountWindow' );
        var selection = deleteAccountWindow.modelData.selection;
        var key = '';
        if ( selection )
        {
            key = Ext.Array.pluck(selection, 'internalId');
        }
        else
        {
            key = deleteAccountWindow.modelData.key;
        }

        var me = this;
        var parentApp = parent.mainApp;
        function onSuccessCallback(response, opts)
        {
            // clear account selection
            var gridSelectionPlugin = me.getPersistentGridSelectionPlugin();
            gridSelectionPlugin.clearSelection();
            // refresh account grid panel
            var accountGrid = me.getUserGrid();
            accountGrid.getStore().load();

            deleteAccountWindow.close();
            if ( parentApp )
            {
                parentApp.fireEvent( 'notifier.show', "Accounts was deleted", "One morning, when Gregor Samsa woke from troubled dreams, he found himself transformed in his bed into a horrible vermin", false );
            }
        }

        function onFailureCallback(response, opts)
        {
            deleteAccountWindow.close();
            Ext.Msg.alert( 'Error', response.status + ' ' + response.statusText );
        }

        Ext.Ajax.request(
            {
                url: 'data/account/delete',
                method: 'POST',
                params: { key: key },
                success: onSuccessCallback,
                failure: onFailureCallback
            }
        );
    },

    getPersistentGridSelectionPlugin: function()
    {
        return this.getUserGrid().getPlugin( 'persistentGridSelection' );
    },

    getUserGrid: function()
    {
        return Ext.ComponentQuery.query( 'accountGrid' )[0];
    },

    countryChangeHandler: function( field, newValue, oldValue, options )
    {
        var region = field.up( 'addressPanel' ).down( '#iso-region' );
        if ( region )
        {
            region.clearValue();
            Ext.apply( region.store.proxy.extraParams, {
                'countryCode': field.getValue()
            } );

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
        var displayName = Ext.get( 'display-name' );
        if ( displayName )
        {
            var displayNameValue = prefix + ' ' + firstName + ' ' + middleName + ' ' + lastName + ' ' + suffix;
            displayName.dom.value = Ext.String.trim( displayNameValue.replace( /  /g, ' ' ) );
        }
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

    leaveGroup: function( element, event )
    {
        var groupItem = element.up( 'groupDetailButton' );
        var groupPanel = element.up( '#groupPanel' );
        var userPanel = element.up( 'editUserPanel' );
        Ext.Ajax.request( {
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
                          } );
    },

    saveUser: function( button )
    {
        var editUserForm = button.up( 'editUserPanel' );
        if ( editUserForm.getForm().isValid() )
        {
            var formValues = editUserForm.getValues();
            var userData = {
                username: formValues['username'],
                'display-name': Ext.get( 'display-name' ).dom.value,
                email: formValues['email'],
                key: editUserForm.userFields.key,
                userStore: editUserForm.userFields.userStore ? editUserForm.userFields.userStore
                        : editUserForm.defaultUserStoreName,
                userInfo: formValues
            };
            var tabPanel = editUserForm.down( 'addressContainer' );
            var tabs = tabPanel.query( 'form' );
            var addresses = [];
            for ( var index in tabs )
            {
                var address = tabs[index].getValues();
                Ext.Array.include( addresses, address );
            }
            userData.userInfo.addresses = addresses;

            Ext.Ajax.request( {
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
                              } );
        }
        else
        {
            Ext.Msg.alert( 'Error', 'Some required fields are missing' );
        }
    },

    showEditUserForm: function( account, callback, indexToInsertTab )
    {
        if ( !account ) {
            var window = Ext.create( 'widget.selectUserStoreWindow', {caller: 'user'} );
            window.show();
        }
        else
        {
            var tabPane = this.getCmsTabPanel();
            var me = this;
            // Make sure it is array
            account = [].concat(account);
            for (var i = 0; i < account.length; i++) {
                var selected = account[i].data || account[i];
                if (!selected.isEditable)
                {
                    continue ;
                }
                if (selected.type === 'user') {
                    var requestConfig = {
                        url: 'data/user/userinfo',
                        method: 'GET',
                        params: {key: selected.key},
                        createTabFromResponse: function (response)
                        {
                            var jsonObj = Ext.JSON.decode( response.responseText );
                            var tab = {
                                xtype: 'userWizardPanel',
                                userstore: jsonObj.userStore,
                                qUserName: jsonObj.name,
                                userFields: jsonObj,
                                hasPhoto: jsonObj.hasPhoto,
                                autoScroll: true
                            };
                            var tabCmp = Ext.widget(tab.xtype, tab);
                            var wizardPanel = tabCmp.down('wizardPanel');

                            var data = me.userInfoToWizardData(jsonObj);
                            wizardPanel.addData( data );
                            tabCmp.updateHeader( {value: jsonObj.displayName, edited: true} );
                            if ( Ext.isFunction( callback ) ) {
                                callback();
                            }
                            return tabCmp;
                        }
                    };
                    var tabItem = {
                        id: 'tab-edit-user-' + selected.userStore + '-' + selected.name,
                        title: selected.displayName + ' (' + selected.qualifiedName + ')',
                        iconCls: 'icon-edit-user',
                        closable: true,
                        layout: 'fit'
                    };
                    tabPane.addTab(tabItem, indexToInsertTab, requestConfig);
                } else {
                    var requestConfig = {
                        url: 'data/account/groupinfo',
                        method: 'GET',
                        params: {key: selected.key},
                        createTabFromResponse: function (response)
                        {
                            var jsonObj = Ext.JSON.decode( response.responseText );
                            var tab = {
                                xtype: 'groupWizardPanel',
                                modelData: jsonObj.group,
                                autoScroll: true
                            };
                            if ( Ext.isFunction( callback ) ) {
                                callback();
                            }
                            return tab;
                        }
                    };
                    var tabItem = {
                        id: 'tab-edit-group-' + selected.key,
                        title: selected.displayName,
                        iconCls: 'icon-new-group',
                        closable: true,
                        layout: 'fit'
                    };
                    tabPane.addTab(tabItem, indexToInsertTab, requestConfig);
                }
            }
        }
    },

    userInfoToWizardData: function ( userData )
    {
        var data = {
            'userStore': userData.userStore,
            'key': userData.key,
            'email': userData.email,
            'username': userData.username,
            'display-name': userData['display-name'],
            'userInfo': userData.userInfo
        };
        return data;
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

    addNewTab: function( button, event )
    {
        var tabPanel = button.up( 'addressContainer' );
        var closable = tabPanel.down( 'addressColumn' ).items.getCount() != 0;
        var newTab = this.getEditUserFormPanel().generateAddressPanel( tabPanel.sourceField, closable );
        newTab = tabPanel.down( 'addressColumn' ).add( newTab );
    },

    getCmsTabPanel: function()
    {
        return Ext.ComponentQuery.query( 'cmsTabPanel' )[0];
    },

    getEditUserFormPanel: function()
    {
        return Ext.ComponentQuery.query( 'editUserFormPanel' )[0];
    },

    getAccountDetailPanel: function()
    {
        return Ext.ComponentQuery.query( 'accountDetail' )[0];
    }

} );