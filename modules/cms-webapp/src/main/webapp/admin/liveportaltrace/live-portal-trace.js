var historySize = 300;

var reloadCurrentRequestsIntervalId = 0;
var reloadLongestPageRequestsIntervalId = 0;
var reloadLongestAttachmentRequestsIntervalId = 0;
var reloadLongestImageRequestsIntervalId = 0;
var loadNewPastRequestsIntervalId = 0;
var refreshSystemInfoIntervalId = 0;

var lastCompletedNumber = -1;

var memoryGraphValues = new Array( 170 );
var entityCacheCapacityGraphValues = new Array( 170 );
var pageCacheCapacityGraphValues = new Array( 170 );
var completedRequestsGraphValues = new Array( 270 );

function resolveURLAndAddParams( params )
{
    return "servlet/tools/com.enonic.cms.core.tools.LivePortalTraceController?page=914&op=custom&" + params;
}

function stopAutomaticUpdate()
{
    clearInterval( reloadCurrentRequestsIntervalId );
    clearInterval( reloadLongestPageRequestsIntervalId );
    clearInterval( reloadLongestAttachmentRequestsIntervalId );
    clearInterval( reloadLongestImageRequestsIntervalId );
    clearInterval( loadNewPastRequestsIntervalId );

    document.getElementById( "stop-auto-update" ).disabled = true;
    document.getElementById( "start-auto-update" ).disabled = false;
    document.getElementById( "fetch-recent-history" ).disabled = false;
}

function startAutomaticUpdate()
{
    startAutomaticUpdateOfCurrent();
    startAutomaticUpdateOfLongestPageRequests();
    startAutomaticUpdateOfLongestAttachmentRequests();
    startAutomaticUpdateOfLongestImageRequests();
    startAutomaticUpdateOfHistory();

    document.getElementById( "stop-auto-update" ).disabled = false;
    document.getElementById( "start-auto-update" ).disabled = true;
    document.getElementById( "fetch-recent-history" ).disabled = true;
}

function startAutomaticUpdateOfCurrent()
{
    (function loop()
    {
        reloadCurrentRequestsIntervalId = setTimeout( function()
                                                      {
                                                          reloadCurrentPortalRequests();
                                                          loop();
                                                      }, 2000 );
    })();

}

function startAutomaticUpdateOfLongestPageRequests()
{
    (function loop()
    {
        reloadLongestPageRequestsIntervalId = setTimeout( function()
                                                          {
                                                              reloadLongestPortalPageRequests();
                                                              loop();
                                                          }, 10000 );
    })();
}

function startAutomaticUpdateOfLongestAttachmentRequests()
{
    (function loop()
    {
        reloadLongestAttachmentRequestsIntervalId = setTimeout( function()
                                                                {
                                                                    reloadLongestPortalAttachmentRequests();
                                                                    loop();
                                                                }, 10000 );
    })();
}

function startAutomaticUpdateOfLongestImageRequests()
{
    (function loop()
    {
        reloadLongestImageRequestsIntervalId = setTimeout( function()
                                                           {
                                                               reloadLongestPortalImageRequests();
                                                               loop();
                                                           }, 10000 );
    })();
}

function startAutomaticUpdateOfHistory()
{
    (function loop()
    {
        loadNewPastRequestsIntervalId = setTimeout( function()
                                                    {
                                                        loadNewPastPortalRequestTraces();
                                                        loop();
                                                    }, 1000 );
    })();
}

function startAutomaticUpdateOfSystemInfo()
{
    (function loop()
    {
        refreshSystemInfoIntervalId = setTimeout( function()
                                                  {
                                                      refreshSystemInfo();
                                                      loop();
                                                  }, 1000 );
    })();
}

function closePortalRequestTraceDetailWindow()
{
    $( "#portalRequestTraceDetail-window" ).hide();
}

function openPortalRequestTraceDetailWindow()
{
    $( "#portalRequestTraceDetail-window" ).show();
}

function showPortalRequestTraceDetail( html )
{
    $( "#portalRequestTraceDetail-details" ).html( html );

    openPortalRequestTraceDetailWindow();
}

function toggleWindowRenderingTrace( id )
{
    $( "#window-rendering-trace-" + id ).toggle();
}

function toggleDatasourceExecutionTrace( id )
{
    $( "#datasource-execution-trace-" + id ).toggle();
}

function toggleClientMethodExecutionTrace( id )
{
    $( "#client-method-execution-trace-" + id ).toggle();
}

function toggleContentIndexQueryTrace( id )
{
    $( "#content-index-query-trace-" + id ).toggle();
}

function reloadCurrentPortalRequests()
{
    $( "#window-current" ).load( resolveURLAndAddParams( "window=current" ) );
}

function reloadLongestPortalPageRequests()
{
    $( "#window-longest-pagerequests" ).load( resolveURLAndAddParams( "window=longestpagerequests" ) );
}

function clearLongestPageRequestTraces()
{
    jQuery.ajax( {
                     url: resolveURLAndAddParams( "command=clear-longestpagerequests" ),
                     type: 'POST',
                     cache: false,
                     async: true,
                     dataType: 'html',
                     success: reloadLongestPortalPageRequests
                 } );
}

function reloadLongestPortalAttachmentRequests()
{
    $( "#window-longest-attachmentrequests" ).load( resolveURLAndAddParams( "window=longestattachmentrequests" ) );
}

function clearLongestAttachmentRequestTraces()
{
    jQuery.ajax( {
                     url: resolveURLAndAddParams( "command=clear-longestattachmentrequests" ),
                     type: 'POST',
                     cache: false,
                     async: true,
                     dataType: 'html',
                     success: reloadLongestPortalAttachmentRequests

                 } );
}

function reloadLongestPortalImageRequests()
{
    $( "#window-longest-imagerequests" ).load( resolveURLAndAddParams( "window=longestimagerequests" ) );
}

function clearLongestImageRequestTraces()
{
    jQuery.ajax( {
                     url: resolveURLAndAddParams( 'command=clear-longestimagerequests' ) ,
                     type: 'POST',
                     cache: false,
                     async: true,
                     dataType: 'html',
                     success: reloadLongestPortalImageRequests
                 } );
}

function setLastCompletedNumber( number )
{
    lastCompletedNumber = number;
}

function loadNewPastPortalRequestTraces()
{

    var url = resolveURLAndAddParams( "history=true&completed-since-number=" + lastCompletedNumber );

    $.getJSON( url, function( jsonObj )
    {
        var lastCompletedNumber = jsonObj.lastCompletedNumber;
        setLastCompletedNumber( lastCompletedNumber );

        var completedPortalRequestTraces = jsonObj.completedPortalRequestTraces;

        var numberOfRows = $( "#newPastPortalRequestTraces-table-body tr" ).length;
        var initialLoad = numberOfRows == 0;

        var table = document.getElementById( "newPastPortalRequestTraces-table" );
        var tableBody = document.getElementById( "newPastPortalRequestTraces-table-body" );

        if ( initialLoad )
        {
            var insertCount = 0;
            for ( var key1 in completedPortalRequestTraces )
            {
                var tr = createPortalRequestTraceTR( completedPortalRequestTraces[key1] );
                tableBody.appendChild( tr );

                insertCount++;
                if ( insertCount >= historySize )
                {
                    break;
                }
            }

            completedPortalRequestTraces.reverse();
            graphCompletedRequests( completedPortalRequestTraces );
        }
        else
        {
            var count = 0;
            completedPortalRequestTraces.reverse();
            for ( var key2 in completedPortalRequestTraces )
            {
                count++;
                if ( numberOfRows + count > historySize )
                {
                    table.deleteRow( -1 );
                }

                var firstTr = tableBody.getElementsByTagName( "tr" )[0];
                var completedPortalRequestTrace = completedPortalRequestTraces[key2];
                tableBody.insertBefore( createPortalRequestTraceTR( completedPortalRequestTrace ), firstTr );
            }
            graphCompletedRequests( completedPortalRequestTraces );
        }
    } );
}

function createPortalRequestTraceTR( completedPortalRequestTrace )
{
    var portalRequestTrace = completedPortalRequestTrace.portalRequestTrace;

    var tr = document.createElement( "tr" );
    tr.mydata = $.base64.decode( portalRequestTrace.detailHtml );
    tr.onclick = function()
    {
        showPortalRequestTraceDetail( this.mydata );
    };

    var td1 = document.createElement( "td" );
    td1.innerHTML = portalRequestTrace.completedNumber;
    td1.className = "id-column";
    tr.appendChild( td1 );

    var td2 = document.createElement( "td" );
    td2.innerHTML = portalRequestTrace.type;
    td2.className = "type-column";
    tr.appendChild( td2 );

    var td3 = document.createElement( "td" );
    var siteNameDecoded = $.base64.decode( portalRequestTrace.siteName );
    var siteLocalUrlDecoded = $.base64.decode( portalRequestTrace.siteLocalUrl );
    td3.innerHTML = siteNameDecoded + " : " + siteLocalUrlDecoded;
    td3.title = siteNameDecoded + " : " + siteLocalUrlDecoded;
    td3.className = "url-column";
    tr.appendChild( td3 );

    var td4 = document.createElement( "td" );
    td4.innerHTML = portalRequestTrace.startTime;
    td4.className = "startTime-column";
    td4.title = portalRequestTrace.startTime;
    tr.appendChild( td4 );

    var td5 = document.createElement( "td" );
    td5.innerHTML = portalRequestTrace.executionTime;
    td5.className = "duration-column";
    td5.title = portalRequestTrace.executionTime;
    tr.appendChild( td5 );

    var td6 = document.createElement( "td" );
    var cacheUsageDecoded = $.base64.decode( portalRequestTrace.cacheUsage );
    td6.innerHTML = cacheUsageDecoded;
    td6.className = "cacheUsage-column";
    tr.appendChild( td6 );

    return tr;
}

var endTimeOfLastRecordedCompletedRequest = null;
var peakCompletedRequestsPrSecond = 0;
var lastSecondCounter = 0;

function graphCompletedRequests( portalRequestTraces )
{
    if ( !isInitialized( completedRequestsGraphValues ) )
    {
        initializeArray( completedRequestsGraphValues, 0 );
    }

    if ( portalRequestTraces.length === 0 )
    {
        shiftAndAdd( completedRequestsGraphValues, lastSecondCounter );
        lastSecondCounter = 0;
    }
    else
    {
        for ( var key in portalRequestTraces )
        {
            var pastPortalRequestTrace = portalRequestTraces[key];
            var trace = pastPortalRequestTrace.portalRequestTrace;

            var currTime = new Date( trace.endTime );

            if ( endTimeOfLastRecordedCompletedRequest == null )
            {
                // first recording
                shiftAndAdd( completedRequestsGraphValues, lastSecondCounter );
                lastSecondCounter = 0;
            }
            else if ( isWithinSameSecond( currTime, endTimeOfLastRecordedCompletedRequest ) )
            {
                // within same second, increment last with one
                lastSecondCounter++;
            }
            else
            {
                // new second, record possible peak
                if ( lastSecondCounter > peakCompletedRequestsPrSecond )
                {
                    peakCompletedRequestsPrSecond = lastSecondCounter;
                    $("#peak-number-of-completed-request-pr-second").html( peakCompletedRequestsPrSecond );
                }
                shiftAndAdd( completedRequestsGraphValues, lastSecondCounter );
                lastSecondCounter = 1;
            }
            endTimeOfLastRecordedCompletedRequest = currTime;
        }
    }

    $("#last-number-of-completed-request-pr-second").html( completedRequestsGraphValues[completedRequestsGraphValues.length - 1]);

    $( '#graph-completed-requests-pr-second' ).sparkline( completedRequestsGraphValues,
                                                          {chartRangeMin: 0, chartRangeMax: 100, type: 'line', lineColor: '#939F74', fillColor: '#ECFFBB', height: '2em'} );
}

function isWithinSameSecond( date1, date2 )
{
    if ( date1.getFullYear() !== date2.getFullYear() )
    {
        return false;
    } else if ( date1.getMonth() !== date2.getMonth() )
    {
        return false;
    } else if ( date1.getDate() !== date2.getDate() )
    {
        return false;
    } else if ( date1.getHours() !== date2.getHours() )
    {
        return false;
    } else if ( date1.getMinutes() !== date2.getMinutes() )
    {
        return false;
    } else if ( date1.getSeconds() !== date2.getSeconds() )
    {
        return false;
    }

    return true;
}

function refreshSystemInfo()
{

    var url = resolveURLAndAddParams( "system-info=true" );

    $.getJSON( url, function( jsonObj )
    {
        $( '#current-requests-tab-label' ).text( jsonObj.portal_request_traces_in_progress );

        $( '#entity-cache-count' ).text( jsonObj.entity_cache_count );
        $( '#entity-cache-hit-count' ).text( jsonObj.entity_cache_hit_count );
        $( '#entity-cache-miss-count' ).text( jsonObj.entity_cache_miss_count );
        $( '#entity-cache-capacity-count' ).text( jsonObj.entity_cache_capacity_count );

        graphEntityCacheCapacity( jsonObj.entity_cache_count, jsonObj.entity_cache_capacity_count, jsonObj.entity_cache_hit_count,
                                  jsonObj.entity_cache_miss_count );

        $( '#page-cache-count' ).text( jsonObj.page_cache_count );
        $( '#page-cache-hit-count' ).text( jsonObj.page_cache_hit_count );
        $( '#page-cache-miss-count' ).text( jsonObj.page_cache_miss_count );
        $( '#page-cache-capacity-count' ).text( jsonObj.page_cache_capacity_count );

        graphPageCacheCapacity( jsonObj.page_cache_count, jsonObj.page_cache_capacity_count, jsonObj.page_cache_hit_count,
                                jsonObj.page_cache_miss_count );

        $( '#java-heap-memory-usage-init' ).text( humanReadableBytes( jsonObj.java_heap_memory_usage_init ) );
        $( '#java-heap-memory-usage-used' ).text( humanReadableBytes( jsonObj.java_heap_memory_usage_used ) );
        $( '#java-heap-memory-usage-committed' ).text( humanReadableBytes( jsonObj.java_heap_memory_usage_committed ) );
        $( '#java-heap-memory-usage-max' ).text( humanReadableBytes( jsonObj.java_heap_memory_usage_max ) );

        graphMemory( jsonObj.java_heap_memory_usage_used, jsonObj.java_heap_memory_usage_max );

        $( '#java-non-heap-memory-usage-init' ).text( humanReadableBytes( jsonObj.java_non_heap_memory_usage_init ) );
        $( '#java-non-heap-memory-usage-used' ).text( humanReadableBytes( jsonObj.java_non_heap_memory_usage_used ) );
        $( '#java-non-heap-memory-usage-committed' ).text( humanReadableBytes( jsonObj.java_non_heap_memory_usage_committed ) );
        $( '#java-non-heap-memory-usage-max' ).text( humanReadableBytes( jsonObj.java_non_heap_memory_usage_max ) );

        $( '#java-thread-count' ).text( jsonObj.java_thread_count );
        $( '#java-thread-peak-count' ).text( jsonObj.java_thread_peak_count );

        var data_source_open_connection_count = jsonObj.data_source_open_connection_count;
        if ( data_source_open_connection_count == -1 )
        {
            $( '#data-source-open-connection-count' ).text( "N/A" );
        }
        else
        {
            $( '#data-source-open-connection-count' ).text( jsonObj.data_source_open_connection_count );
        }

    } );
}

function graphMemory( used, max )
{
    if ( !isInitialized( memoryGraphValues ) )
    {
        initializeArray( memoryGraphValues, 0 );
    }

    shiftAndAdd( memoryGraphValues, used );

    $( '#graph-memory' ).sparkline( memoryGraphValues,
                                    {chartRangeMin: 0, chartRangeMax: max, type: 'line', lineColor: '#939F74', fillColor: '#ECFFBB', height: '2em'} );

}

function graphEntityCacheCapacity( count, capacity, hitCount, missCount )
{
    if ( !isInitialized( entityCacheCapacityGraphValues ) )
    {
        initializeArray( entityCacheCapacityGraphValues, 0 );
    }

    shiftAndAdd( entityCacheCapacityGraphValues, count );

    $( '#graph-entity-cache-capacity' ).sparkline( entityCacheCapacityGraphValues,
                                                   {chartRangeMin: 0, chartRangeMax: capacity, type: 'line', lineColor: '#C49183', fillColor: '#E5AA99', height: '2em'} );

    $( '#graph-entity-cache-hits-vs-misses' ).sparkline( [missCount, hitCount],
                                                         {type: 'pie', height: '1.7em', sliceColors: ['#ECB9AE','#78C469']} );
}

function graphPageCacheCapacity( count, capacity, hitCount, missCount )
{
    if ( !isInitialized( pageCacheCapacityGraphValues ) )
    {
        initializeArray( pageCacheCapacityGraphValues, 0 );
    }

    shiftAndAdd( pageCacheCapacityGraphValues, count );

    $( '#graph-page-cache-capacity' ).sparkline( pageCacheCapacityGraphValues,
                                                 {chartRangeMin: 0, chartRangeMax: capacity, type: 'line', lineColor: '#70A5A9', fillColor: '#8ED0D5', height: '2em'} );

    $( '#graph-page-cache-hits-vs-misses' ).sparkline( [missCount, hitCount],
                                                       {type: 'pie', height: '1.7em', sliceColors: ['#ECB9AE','#78C469']} );
}

function humanReadableBytes( size )
{

    var suffix = ["bytes", "KB", "MB", "GB", "TB", "PB"],

        tier = 0;

    while ( size >= 1024 )
    {

        size = size / 1024;

        tier++;

    }

    return Math.round( size * 10 ) / 10 + " " + suffix[tier];
}

function isInitialized( array )
{
    if ( array.length == 0 )
    {
        return false;
    }

    return array[ 0 ] != undefined;
}

function initializeArray( array, value )
{
    for ( var i = 0; i < array.length; i++ )
    {
        if ( array[i] == undefined )
        {
            array[i] = value;
        }
    }
}

function shiftAndAdd( array, value )
{
    for ( var i = 1; i < array.length; i++ )
    {
        array[ i - 1 ] = array[ i ];
    }

    array[ array.length - 1 ] = value;
}