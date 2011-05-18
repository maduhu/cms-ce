/*
 * Copyright 2000-2011 Enonic AS
 * http://www.enonic.com/license
 */
package com.enonic.cms.core.security.group;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import javax.inject.Inject;

import org.springframework.util.Assert;

import com.enonic.esl.util.UncheckedCastUtil;

import com.enonic.cms.core.security.IAccordionPresentation;
import com.enonic.cms.core.security.user.AccordionSearchCriteria;
import com.enonic.cms.core.security.user.UserEntity;
import com.enonic.cms.core.security.userstore.UserStoreEntity;
import com.enonic.cms.store.dao.CategoryAccessDao;
import com.enonic.cms.store.dao.ContentAccessDao;
import com.enonic.cms.store.dao.DefaultSiteAccessDao;
import com.enonic.cms.store.dao.GroupDao;
import com.enonic.cms.store.dao.MenuItemAccessDao;
import com.enonic.cms.store.dao.UserDao;
import com.enonic.cms.store.dao.UserStoreDao;

public class GroupStorageServiceImpl implements GroupStorageService
{
    private GroupDao groupDao;

    private UserDao userDao;

    private UserStoreDao userStoreDao;

    private MenuItemAccessDao menuItemAccessDao;

    private CategoryAccessDao categoryAccessDao;

    private ContentAccessDao contentAccessDao;

    private DefaultSiteAccessDao defaultSiteAccessDao;

    public GroupKey storeNewGroup( StoreNewGroupCommand command )
    {
        UserStoreEntity userStore = null;
        if ( command.getUserStoreKey() != null )
        {
            userStore = userStoreDao.findByKey( command.getUserStoreKey() );
        }

        UserEntity user = null;
        if ( command.getUserKey() != null )
        {
            user = userDao.findByKey( command.getUserKey().toString() );
        }

        final GroupEntity newGroup = new GroupEntity();
        newGroup.setRestricted( command.isRestriced() );
        newGroup.setDeleted( false );
        newGroup.setDescription( command.getDescription() );
        newGroup.setName( command.getName() );
        final String syncValue = command.getSyncValue();
        newGroup.setSyncValue( syncValue == null ? "NA" : syncValue );
        if ( user != null )
        {
            newGroup.setUser( user );
        }
        newGroup.setUserStore( userStore );
        newGroup.setType( command.getType() );

        if ( command.getMembers() != null )
        {
            for ( GroupKey memberKey : command.getMembers() )
            {
                GroupEntity member = groupDao.find( memberKey.toString() );

                if ( newGroup.getUserStore() != null && !newGroup.getUserStore().equals( member.getUserStore() ) )
                {
                    throw new IllegalArgumentException(
                        member.getQualifiedName() + " cannot be member of group " + newGroup.getQualifiedName() +
                            ". Group and member must be located in same user store." );
                }
                member.addMembership( newGroup );
            }
        }
        groupDao.storeNew( newGroup );
        return newGroup.getGroupKey();
    }

    public void addMembershipToGroup( GroupEntity groupToAdd, GroupEntity groupToAddTo )
    {
        groupToAdd.addMembership( groupToAddTo );
    }

    public void removeMembershipFromGroup( GroupEntity groupToRemove, GroupEntity groupToRemoveFrom )
    {
        if ( groupToRemove.hasMembership( groupToRemoveFrom ) )
        {
            groupToRemove.removeMembership( groupToRemoveFrom );
        }
    }

    public void updateGroup( UpdateGroupCommand command )
    {
        GroupEntity group = groupDao.findByKey( command.getGroupKey() );
        group.setName( command.getName() );
        group.setDescription( command.getDescription() );
        if ( group.isBuiltIn() )
        {
            // Force restricted enrollment for built-in groups - always!
            group.setRestricted( true );
        }
        else
        {
            if ( command.isRestricted() != null )
            {
                group.setRestricted( command.isRestricted() ? 1 : 0 );
            }
        }

        synchronizeMembers( group, command );
    }

    private void synchronizeMembers( GroupEntity group, UpdateGroupCommand command )
    {
        if ( command.getMembers() == null )
        {
            return;
        }

        List<GroupEntity> membersToRemove = new ArrayList<GroupEntity>();
        for ( GroupEntity existingMember : group.getMembers( false ) )
        {
            if ( !command.hasMember( existingMember.getGroupKey() ) )
            {
                membersToRemove.add( existingMember );
            }
        }
        for ( GroupEntity memberToRemove : membersToRemove )
        {
            memberToRemove.removeMembership( group );
        }

        addMembershipsToGroup( group, command.getMembers() );
    }

    private void addMembershipsToGroup( final GroupEntity groupToJoinAsMember, final Collection<GroupEntity> membershipsToAdd )
    {
        for ( GroupEntity member : membershipsToAdd )
        {
            if ( member != null && !member.hasMembership( groupToJoinAsMember ) )
            {
                if ( groupToJoinAsMember.getUserStore() != null && !groupToJoinAsMember.getUserStore().equals( member.getUserStore() ) )
                {
                    throw new IllegalArgumentException(
                        member.getQualifiedName() + " cannot be member of group " + groupToJoinAsMember.getQualifiedName() +
                            ". Group and member must be located in same user store." );
                }
                member.addMembership( groupToJoinAsMember );
            }
        }
    }

    public void deleteGroup( final DeleteGroupCommand command )
    {
        final GroupEntity groupToDelete = groupDao.findSingleBySpecification( command.getSpecification() );

        Assert.notNull( groupToDelete, "No group matching specification: " + command.getSpecification() );

        groupToDelete.setDeleted( true );

        final GroupKey groupKey = groupToDelete.getGroupKey();
        defaultSiteAccessDao.deleteByGroupKey( groupKey );
        menuItemAccessDao.deleteByGroupKey( groupKey );
        contentAccessDao.deleteByGroupKey( groupKey );
        categoryAccessDao.deleteByGroupKey( groupKey );
    }

    @Override
    public Long count()
    {
        return groupDao.count( GroupEntity.class );
    }

    @Override
    public List<IAccordionPresentation> findByCriteria( AccordionSearchCriteria criteria )
    {
        return ( criteria.hasCriteria() )
                ? UncheckedCastUtil.castList( groupDao.findByCriteria( criteria ), IAccordionPresentation.class )
                : UncheckedCastUtil.castList( groupDao.findAll( false ), IAccordionPresentation.class );
    }

    @Inject
    public void setGroupDao( GroupDao groupDao )
    {
        this.groupDao = groupDao;
    }

    @Inject
    public void setUserDao( UserDao userDao )
    {
        this.userDao = userDao;
    }

    @Inject
    public void setUserStoreDao( UserStoreDao userStoreDao )
    {
        this.userStoreDao = userStoreDao;
    }

    @Inject
    public void setMenuItemAccessDao( MenuItemAccessDao menuItemAccessDao )
    {
        this.menuItemAccessDao = menuItemAccessDao;
    }

    @Inject
    public void setCategoryAccessDao( CategoryAccessDao categoryAccessDao )
    {
        this.categoryAccessDao = categoryAccessDao;
    }

    @Inject
    public void setContentAccessDao( ContentAccessDao contentAccessDao )
    {
        this.contentAccessDao = contentAccessDao;
    }

    @Inject
    public void setDefaultSiteAccessDao( DefaultSiteAccessDao defaultSiteAccessDao )
    {
        this.defaultSiteAccessDao = defaultSiteAccessDao;
    }
}