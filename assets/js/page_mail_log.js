// Containers
var $logLoading = $('#app-loading-container');
var $logEmpty = $('#app-log-empty');
var $logContentContainer = $('#app-log-content-container');
var $logContent = $('#app-log-content');

// Buttons
var $btnRefresh = $('.app-button-refresh');
var $btnClear = $('.app-button-clear');
var $btnStartRealTime = $('.app-button-start-real-time');
var $btnStopRealTime = $('.app-button-stop-real-time');

// Button groups
var $grpRealTimeEnabled = $('.app-show-on-realtime-enabled').closest('.level-item');
var $grpRealTimeDisabled = $('.app-show-on-realtime-disabled').closest('.level-item');

// Inputs
var searchOption = $('select[name="search_option"]').val();
var search = $('input[name="search"]').val();

// On startup, hide buttons.
$grpRealTimeEnabled.hide();

// Template
var logTemplate = Handlebars.compile($('#app-log-record-template').html());

// Real time monitoring vars
var timer = null;
var cursor = '';


// On startup
ajaxGetLogContent('refresh');

// Button action
$btnRefresh.on('click', function() {
    ajaxGetLogContent('refresh');
});

$btnClear.on('click', function() {
    clearLogContent();
});

$btnStartRealTime.on('click', function() {
    ajaxGetLogContent('real_time');

    timer = setInterval(function() {
        ajaxGetLogContent('real_time');
    }, 3000);

    toggleRealTimeStatus();
});

$btnStopRealTime.on('click', function() {
    clearInterval(timer);

    if ($logContent.children().length === 0)
    {
        showEmptyContainer();
    }

    toggleRealTimeStatus();
});


function toggleRealTimeStatus()
{
    $grpRealTimeDisabled.toggle();
    $grpRealTimeEnabled.toggle();
}

function ajaxGetLogContent(refreshType)
{
    ajax({
        action: 'get_mail_log',
        data: {
            refresh_type:  refreshType,
            cursor:        cursor,
            search_option: searchOption,
            search:        search
        },
        success: function(response)
        {
            if (response.error)
            {
                console.log(response.error_msg);
                return;
            }

            if (refreshType === 'refresh')
            {
                clearLogContent();

                if (response.rows.length === 0)
                {
                    showEmptyContainer();
                }
                else
                {
                    showLogContainer();

                    for (var i = 0; i < response.rows.length; i++)
                    {
                        $logContent.append(logTemplate(response.rows[i]));
                    }
                }
            }
            else if (refreshType === 'real_time')
            {
                showLogContainer();

                for (var i=response.rows.length-1; i >= 0; i--)
                {
                    $logContent.prepend(logTemplate(response.rows[i]));
                }
            }

            cursor = response.cursor;
        },
        error: function(textStatus, error)
        {
            ajaxLogError(textStatus, error);
        },
        beforeSend: function()
        {
            if (refreshType === 'refresh')
            {
                $btnRefresh.addClass('is-loading');
            }
        },
        complete: function()
        {
            $btnRefresh.removeClass('is-loading');
            $logLoading.hide();
        }
    });
}

function clearLogContent()
{
    $logContent.html('');
}

function showEmptyContainer()
{
    $logEmpty.show();
    $logContentContainer.hide();
}

function showLogContainer()
{
    $logEmpty.hide();
    $logContentContainer.show();
}
