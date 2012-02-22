if ( !Templates )
{
    var Templates = {};
}

Templates.common = {
    wizardPanelSteps:
            '<ul class="cms-wizard-navigation clearfix">' +
                    '<tpl for=".">' +
                    '<li class="{[ this.resolveClsName( xindex, xcount ) ]}" wizardStep="{[xindex]}" >' +
                    '<a href="#" class="step {[ this.resolveClsName( xindex, xcount ) ]}">{[xindex]}. {[  (values.stepTitle || values.title) ]}</a></li>' +
                    '</tpl>' +
                    '</ul>'

    ,userInfo:
            '<div><div class="cms-user-info clearfix"><div class="cms-user-photo cms-left">' +
                    '<tpl if="type===\'user\' && builtIn===false">' +
                    '<img alt="User" src="data/user/photo?key={key}&thumb=true&def=admin/resources%2Fimages%2Ficons%2F256x256%2Fdummy-user.png"/></tpl>' +
                    '<tpl if="type===\'group\'">' +
                    '<img src="resources/images/icons/256x256/group.png" alt="{displayName}"/>' +
                    '</tpl>' +
                    '<tpl if="type===\'role\' || builtIn===true">' +
                    '<img src="resources/images/icons/256x256/masks.png" alt="{displayName}"/>' +
                    '</tpl></div>' +
                    '<div class="cms-left"><h2>{displayName}</h2>({qualifiedName})<br/>' +
                    '<a href="mailto:{email}:">{email}</a></div></div></div>'
    ,groupList:
            '<div class="clearfix">' +
                    '<div class="cms-left">' +
                    '<span class="{[values.type==="user" && !values.builtIn ? "icon-user" : ' +
                    'values.type==="role" || values.builtIn ? "icon-role" : "icon-group"]} cms-list-item"></span></div>' +
                    '<div class="cms-left"><span><tpl if="type==\'user\'"> {displayName} ({qualifiedName})</tpl>' +
                    '<tpl if="type!=\'user\'">{name} ({userStore})</tpl></span>' +
                    '</div>' +
                    '</div>'
    ,notifyUserMessage: 'Hi {0}! Your username is {1}. \n' +
            'If required, please choose userstore: {2} when logging in. \nRegards, {3}.'

};