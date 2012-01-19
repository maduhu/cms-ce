Ext.define( 'App.view.wizard.user.UserWizardPanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.userWizardPanel',
    requires: [
        'Common.WizardPanel',
        'App.view.wizard.user.UserStoreListPanel',
        'App.view.wizard.user.UserWizardToolbar',
        'App.view.EditUserFormPanel',
        'App.view.wizard.user.WizardStepLoginInfoPanel',
        'App.view.wizard.user.WizardStepMembershipPanel',
        'App.view.wizard.user.WizardStepUserSummaryPanel',
        'Common.fileupload.PhotoUploadButton'
    ],

    layout: 'column',

    border: 0,
    autoScroll: true,

    defaults: {
        border: false
    },

    displayNameAutoGenerate: true,

    initComponent: function()
    {
        var me = this;
        var isNew = this.userFields == undefined;
        var photoUrl;
        var userGroups = [];
        var displayNameValue = 'Display Name';
        if ( me.userFields )
        {
            photoUrl = me.hasPhoto ? 'data/user/photo?key=' + me.userFields.key : 'resources/icons/256x256/dummy-user.png';
            userGroups = me.userFields.groups;
            displayNameValue = me.userFields.displayName;
        }
        me.headerData = {
            displayName: displayNameValue,
            userstoreName: me.userstore,
            qUserName: me.qUserName,
            isNewUser: isNew,
            edited: false
        };

        me.tbar = {
            xtype: 'userWizardToolbar',
            isNewUser: isNew
        };
        me.items = [
            {
                width: 121,
                padding: 5,
                items: [
                    {
                        xtype: 'photoUploadButton',
                        width: 111,
                        height: 111,
                        photoUrl: photoUrl,
                        progressBarHeight: 6,
                        listeners: {
                            render: function( cmp ) {
                                Ext.tip.QuickTipManager.register({
                                    target: cmp.el,
                                    text: 'User',
                                    width: 100,
                                    dismissDelay: 10000
                                });
                            }
                        }
                    },
                    {
                        styleHtmlContent: true,
                        height: 50,
                        border: 0,
                        cls: 'cms-image-upload-button-image-tip',
                        html: '<div class="x-tip x-tip-default x-layer" role="tooltip">' +
                                '<div class="x-tip-anchor x-tip-anchor-top"></div>' +
                                '<div class="x-tip-body  x-tip-body-default x-tip-body-default">' +
                                'Click to upload photo</div></div>',
                        listeners: {
                            afterrender: function( cmp ) {
                                Ext.Function.defer( function() {
                                    cmp.hide();
                                }, 10000 );
                            }
                        }
                    }
                ]
            },
            {
                columnWidth: 1,
                padding: '10 10 10 0',
                defaults: {
                    border: false
                },
                items: [
                    {
                        xtype: 'container',
                        itemId: 'wizardHeader',
                        styleHtmlContent: true,
                        autoHeight: true,
                        cls: 'cms-wizard-header-container',
                        listeners: {
                            afterrender: {
                                fn: function()
                                {
                                    var me = this;
                                    me.getEl().addListener( 'click', function( event, target, eOpts )
                                    {
                                        me.toggleDisplayNameField( event, target );
                                    } );
                                },
                                scope: this
                            }
                        },
                        tpl: new Ext.XTemplate(Templates.account.userWizardHeader),
                        data: me.headerData
                    },
                    {
                        xtype: 'wizardPanel',
                        showControls: true,
                        isNew: isNew,
                        items: [
                            {
                                stepTitle: "Profile",
                                itemId: "profilePanel",
                                xtype: 'editUserFormPanel',
                                userFields: me.userFields,
                                enableToolbar: false
                            },
                            {
                                stepTitle: "User",
                                itemId: "userPanel",
                                xtype: 'editUserFormPanel',
                                userFields: me.userFields,
                                includedFields: ['username', 'email', 'password', 'repeat-password', 'photo',
                                    'country', 'locale', 'timezone', 'global-position'],
                                enableToolbar: false
                            },
                            {
                                stepTitle: "Places",
                                itemId: 'placesPanel',
                                xtype: 'editUserFormPanel',
                                includedFields: ['address'],
                                userFields: me.userFields,
                                enableToolbar: false
                            },
                            {
                                stepTitle: "Memberships",
                                groups: userGroups,
                                xtype: 'wizardStepMembershipPanel',
                                listeners: {
                                    afterrender: {
                                        fn: function()
                                        {
                                            var membershipPanel = this.down('wizardStepMembershipPanel');
                                            var wizard = this.down('wizardPanel');
                                            wizard.addData( membershipPanel.getData() );
                                        },
                                        scope: this
                                    }
                                }
                            },
                            {
                                stepTitle: "Summary",
                                xtype: 'wizardStepUserSummaryPanel'
                            }
                        ]
                    }
                ]
            }
        ];

        this.callParent( arguments );

        var uploader = this.down('photoUploadButton');
        uploader.on( 'fileuploaded', me.photoUploaded, me );

        //Render all user forms
        if ( me.userFields && me.userFields.userStore )
        {
            me.renderUserForms( me.userFields.userStore );
        }
        else
        {
            me.renderUserForms( me.userstore );
        }
    },

    toggleDisplayNameField: function( event, target )
    {
        var clickedElement = new Ext.Element( target );
        var parentToClickedElementIsHeader = clickedElement.findParent( '.cms-wizard-header' );
        var displayNameField = Ext.DomQuery.select( 'input.cms-display-name', this.getEl().dom )[0];
        var displayNameFieldElement = new Ext.Element( displayNameField );

        if ( parentToClickedElementIsHeader )
        {
            displayNameFieldElement.dom.removeAttribute( 'readonly' );
            displayNameFieldElement.addCls( 'cms-edited-field' );
        }
        else
        {
            displayNameFieldElement.set( {readonly: true} );
            var value = Ext.String.trim( displayNameFieldElement.getValue() );
            if ( value === '' || value === 'Display Name' )
            {
                displayNameFieldElement.removeCls( 'cms-edited-field' );
            }
        }
    },

    resizeFileUpload: function( file )
    {
        file.el.down( 'input[type=file]' ).setStyle( {
                                                         width: file.getWidth(),
                                                         height: file.getHeight()
                                                     } );
    },

    setFileUploadDisabled: function( disable )
    {
        //TODO: disable image upload
        //this.uploadForm.setDisabled( disable );
    },

    renderUserForms: function( userStore )
    {
        var userForms = this.query( 'editUserFormPanel' );
        Ext.Array.each( userForms, function( userForm )
        {
            userForm.renderUserForm( {userStore: userStore} );
        } );
    },

    updateHeader: function( data )
    {
        Ext.apply(this.headerData, data);
        this.down('#wizardHeader').update(this.headerData);
    },

    isNewUser: function()
    {
        return this.userFields == undefined;
    },

    getData: function()
    {
        var wizard = this.down('wizardPanel');
        var wizardData = wizard.getData();
        var displayNameField = Ext.DomQuery.select( 'input.cms-display-name', this.getEl().dom )[0];
        var displayNameFieldElement = new Ext.Element( displayNameField );
        var displayName = displayNameFieldElement.getValue();
        var data = {displayName: displayName};
        Ext.apply( data, wizardData );
        return data;
    },

    photoUploaded:function ( photoUploadButton, response )
    {
        var wizard = this.down('wizardPanel');
        wizard.addData( {photo:response.photoRef} );
    }

} );