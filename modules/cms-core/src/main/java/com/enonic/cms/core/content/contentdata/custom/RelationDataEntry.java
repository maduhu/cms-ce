/*
 * Copyright 2000-2011 Enonic AS
 * http://www.enonic.com/license
 */
package com.enonic.cms.core.content.contentdata.custom;

import com.enonic.cms.core.content.ContentKey;

public interface RelationDataEntry
    extends InputDataEntry
{
    public ContentKey getContentKey();
}
