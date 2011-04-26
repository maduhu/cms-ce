/*
 * Copyright 2000-2011 Enonic AS
 * http://www.enonic.com/license
 */
package com.enonic.cms.admin.tabs.accounts;

import java.util.List;

import javax.annotation.PostConstruct;

import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;

import com.vaadin.data.Container;
import com.vaadin.data.util.IndexedContainer;
import com.vaadin.ui.Table;

import com.enonic.esl.util.DateUtil;

import com.enonic.cms.core.security.user.User;

@Component
@Scope("vaadin")
public class TablePanel
        extends Table
{
    private static final String TYPE = "type";
    private static final String DISPLAY_NAME = "display name";
    private static final String QUALIFIED_NAME = "qualified name";
    private static final String LAST_MODIFIED = "last modified";

    @PostConstruct
    private void init()
    {
        setStyleName( "accounts-table" );
        setSelectable( true );
        setWidth( "450px" );
        setHeight( "500px" );

        IndexedContainer container = new IndexedContainer();
        container.addContainerProperty( TYPE, String.class, null );
        container.addContainerProperty( DISPLAY_NAME, String.class, null );
        container.addContainerProperty( QUALIFIED_NAME, String.class, null );
        container.addContainerProperty( LAST_MODIFIED, String.class, null );

        setContainerDataSource( container );
    }

    public void showUsers( List<User> users )
    {
        String caption = users.isEmpty() ? "" : String.format( "%s matches", users.size() );
        setCaption( caption );

        Container container = getContainerDataSource();
        container.removeAllItems();

        for ( User user : users )
        {
            Object id = container.addItem();
            container
                    .getContainerProperty( id, TYPE )
                    .setValue( user.getType().getName() );

            container
                    .getContainerProperty( id, DISPLAY_NAME )
                    .setValue( user.getDisplayName() );

            container
                    .getContainerProperty( id, QUALIFIED_NAME )
                    .setValue( user.getQualifiedName() );

            container
                    .getContainerProperty( id, LAST_MODIFIED )
                    .setValue( DateUtil.formatISODate( user.getTimestamp() ) );
        }
    }
}