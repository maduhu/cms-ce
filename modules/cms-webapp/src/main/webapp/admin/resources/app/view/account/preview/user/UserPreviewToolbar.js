Ext.define( 'Admin.view.account.preview.user.UserPreviewToolbar', {
    extend: 'Ext.toolbar.Toolbar',
    alias : 'widget.userPreviewToolbar',


    initComponent: function()
    {

        var buttonDefaults = {
            scale: 'medium',
            iconAlign: 'top',
            minWidth: 64
        };

        var deleteBtn = {
            xtype: 'buttongroup',
            columns: 1,
            defaults: buttonDefaults,
            items: [
                {
                    text: 'Delete',
                    action: 'deleteAccountPreview',
                    iconCls: 'icon-delete-user-24'
                }
            ]};
        var changePasswordBtn = {
            xtype: 'buttongroup',
            columns: 1,
            defaults: buttonDefaults,
            items: [
                {
                    text: 'Change Password',
                    action: 'changePasswordPreview',
                    iconCls: 'icon-change-password-24'
                }
            ]};
        var ediUser = {
            xtype: 'buttongroup',
            columns: 1,
            defaults: buttonDefaults,
            items: [
                {
                    text: 'Edit User',
                    action: 'editUserPreview',
                    iconCls: 'icon-edit-user-24'
                }
            ]};
        this.items = [ ediUser, deleteBtn, changePasswordBtn];
        this.callParent( arguments );
    }

} );