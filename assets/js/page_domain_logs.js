// Handlebars helper
Handlebars.registerHelper('nl2br', function(text) {
    text = Handlebars.Utils.escapeExpression(text);
    text = text.replace(/\\n/gm, '<br>');
    return new Handlebars.SafeString(text);
});

// Containers
var $logLoading = $('#app-loading-container');
var $logEmpty = $('#app-log-empty');
var $logContentContainer = $('#app-log-content-container');
var $logContent = $('#app-log-content');

// Setting fields
var $idDomain = $('input[name="id_domain"]');
var $showAccessLog = $('input[name="show_access_log"]');
var $showErrorLog = $('input[name="show_error_log"]');

// Buttons
var $btnRefresh = $('.app-button-refresh');
var $btnClear = $('.app-button-clear');
var $btnStartRealTime = $('.app-button-start-real-time');
var $btnStopRealTime = $('.app-button-stop-real-time');

// Button groups
var $grpRealTimeEnabled = $('.app-show-on-realtime-enabled').closest('.level-item');
var $grpRealTimeDisabled = $('.app-show-on-realtime-disabled').closest('.level-item');

// On startup, hide buttons.
$grpRealTimeEnabled.hide();

// Template
var logTemplate = Handlebars.compile($('#app-log-record-template').html());

// Real time monitoring vars
var timer = null;
var filePositions = {
    access_log: 0,
    error_log: 0
};


// On startup
ajaxGetLogContent('refresh');

// Button actions
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

    toggleRealTimeStatus();
});


function toggleRealTimeStatus()
{
    $grpRealTimeDisabled.toggle();
    $grpRealTimeEnabled.toggle();
}

function ajaxGetLogContent(refreshType)
{
    currentAjaxCall = ajax({
        action: 'get_log_content',
        data: {
            id_domain: $idDomain.val(),
            refresh_type: refreshType,
            show_access_log: $showAccessLog.val(),
            show_error_log: $showErrorLog.val(),
            file_positions: filePositions
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
                for (var i=response.rows.length-1; i >= 0; i--)
                {
                    $logContent.prepend(logTemplate(response.rows[i]));
                }
            }

            tippy('#app-log-content .app-tooltip-mandatory', tippySettingsTooltipMandatory);

            filePositions.access_log = response.positions.access_log;
            filePositions.error_log = response.positions.error_log;
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

