Ext.define( 'App.view.wizard.group.GroupWizardPanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.groupWizardPanel',
    requires: [
        'Common.WizardPanel',
        'App.view.wizard.group.GroupWizardToolbar',
        'App.view.wizard.group.WizardStepGeneralPanel',
        'App.view.wizard.group.WizardStepMembersPanel',
        'App.view.wizard.group.WizardStepGroupSummaryPanel'
    ],

    layout: 'column',

    border: 0,
    autoScroll: true,

    defaults: {
        border: false
    },

    initComponent: function()
    {
        var me = this;
        var isNew = this.modelData == undefined;
        var displayNameValue = isNew ? 'Display name' : this.modelData.displayName;

        var groupWizardHeader = Ext.create( 'Ext.container.Container', {
            itemId: 'wizardHeader',
            height: 30,
            cls: 'cms-wizard-header-container cms-display-name',
            border: false,
            tpl: "{.}",
            data: displayNameValue
        } );

        var groupWizardToolbar = Ext.createByAlias( 'widget.groupWizardToolbar', {
            xtype: 'groupWizardToolbar',
            isNew: isNew
        } );

        me.tbar = groupWizardToolbar;
        me.items = [
            {
                width: 138,
                padding: '5 5 5 5',
                border: false,
                items: [
                    {
                        xtype: 'container',
                        plain: true,
                        width: 128,
                        height: 128,
                        cls: me.modelData &&
                                (me.modelData.type === 'role') ? 'icon-role-128' : 'icon-group-128'
                    }
                ]
            },
            {
                columnWidth: 1,
                padding: '8 10 10 0',
                defaults: {
                    border: false
                },
                items: [
                    groupWizardHeader,
                    {
                        xtype: 'wizardPanel',
                        showControls: true,
                        validateItems: [
                            groupWizardHeader
                        ],
                        isNew: isNew,
                        items: [
                            {
                                stepTitle: "General",
                                modelData: this.modelData,
                                xtype: 'wizardStepGeneralPanel'
                            },
                            {
                                stepTitle: "Members",
                                modelData: this.modelData,
                                xtype: 'wizardStepMembersPanel'
                            },
                            {
                                stepTitle: "Summary",
                                modelData: this.modelData,
                                xtype: 'wizardStepGroupSummaryPanel'
                            }
                        ]
                    }
                ]
            }
        ];

        this.callParent( arguments );

    }

} );
