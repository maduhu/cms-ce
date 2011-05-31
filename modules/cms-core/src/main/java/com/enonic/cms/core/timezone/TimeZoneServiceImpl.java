/*
 * Copyright 2000-2011 Enonic AS
 * http://www.enonic.com/license
 */
package com.enonic.cms.core.timezone;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Set;
import org.joda.time.DateTimeZone;

/**
 * Sep 8, 2009
 */
public class TimeZoneServiceImpl
    implements TimeZoneService
{
    private final List<DateTimeZone> timeZones;

    public TimeZoneServiceImpl()
    {
        this.timeZones = new ArrayList<DateTimeZone>();

        final Set<String> ids = DateTimeZone.getAvailableIDs();
        this.timeZones.add( DateTimeZone.UTC );
        for ( String id : ids )
        {
            if ( !id.equals( "UTC" ) )
            {
                timeZones.add( DateTimeZone.forID( id ) );
            }
        }
    }

    public List<DateTimeZone> getTimeZones()
    {
        return Collections.unmodifiableList( timeZones );
    }
}