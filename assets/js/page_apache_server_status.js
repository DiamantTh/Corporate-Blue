// Container
var $apacheServerStatus = $('#app-apache-server-status');

// Buttons
var $btnRefresh = $('.app-button-refresh');
var $btnStartRealTime = $('.app-button-start-real-time');
var $btnStopRealTime = $('.app-button-stop-real-time');

// Button groups
var $grpRealTimeEnabled = $('.app-show-on-realtime-enabled').closest('.level-item');
var $grpRealTimeDisabled = $('.app-show-on-realtime-disabled').closest('.level-item');

// Timer for real time updates
var timer;

// On startup, hide buttons.
$grpRealTimeEnabled.hide();


// Button action
$btnRefresh.click(function() {
    ajaxGetApacheServerStatus();
});

$btnStartRealTime.click(function() {
    timer = setInterval(ajaxGetApacheServerStatus, 3000);

    $grpRealTimeEnabled.toggle();
    $grpRealTimeDisabled.toggle();
});

$btnStopRealTime.click(function() {
    clearInterval(timer);

    $grpRealTimeEnabled.toggle();
    $grpRealTimeDisabled.toggle();
});


// Get status page with ajax
function ajaxGetApacheServerStatus()
{
    ajax({
        action: 'get_apache_server_status',
        dataType: 'html',
        data: {
            theme: hash['theme']
        },
        success: function(data)
        {
            $apacheServerStatus.html(data);
        },
        beforeSend: function()
        {
            $btnRefresh.addClass('is-loading');
        },
        complete: function()
        {
            $btnRefresh.removeClass('is-loading');
        }
    });
}