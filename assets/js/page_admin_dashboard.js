//======================================================================================================================
// News
//======================================================================================================================

    var $newsContainer = $('#app-news-container');

    if ($newsContainer.length)
    {
        var newsTemplate = Handlebars.compile($('#app-news-template').html());

        ajax({
            action: 'get_news',
            data: {
                language: hash['language']
            },
            success: function(response) {
                if (response.error)
                {
                    $newsContainer.html(response.error_msg.replace(/\n/, '<br>'));
                }
                else
                {
                    $newsContainer.html('');
                    var till = response.items.length > 2 ? 2 : response.items.length;
                    for (var i = 0; i < till; i++)
                    {
                        var placeholder = response.items[i];
                        placeholder.excerpt = $('<textarea></textarea>').html(placeholder.excerpt).text();

                        placeholder.has_spacer = i < (till - 1);
                        $newsContainer.append(newsTemplate(placeholder));
                    }
                }
            },
            error: function(textStatus, error)
            {
                $newsContainer.html('AJAX_ERROR');
                ajaxLogError(textStatus, error);
            },
            beforeSend: function()
            {
                $newsContainer.addClass('is-loading');
            },
            complete: function()
            {
                $newsContainer.removeClass('is-loading');
            }
        });
    }

//======================================================================================================================
// KeyHelp updates available
//======================================================================================================================

    var $keyhelpUpdateAvailable = $('#app-keyhelp-update-available');
    var $keyhelpUpdateInfoError = $('#app-keyhelp-update-info-error');

    ajax({
        action   : 'get_latest_keyhelp_version',
        success: function(response)
        {
            if (response.error)
            {
                $keyhelpUpdateInfoError.show();
            }
            else if (response.is_update_available)
            {
                $keyhelpUpdateAvailable.show();
            }
        },
        error: function(textStatus, error)
        {
            $keyhelpUpdateInfoError.show();
            ajaxLogError(textStatus, error);
        }
    });

//======================================================================================================================
// Software updates available
//======================================================================================================================

    var $softwareUpdatesAvailable = $("#app-software-updates-available");
    var $softwareUpdatesContainer = $softwareUpdatesAvailable.parent();
    var $rebootRequired = $("#app-reboot-required");
    var $distUpgradeNote = $("#app-dist-upgrade-note");

    ajax({
        action: 'get_package_updates',
        success: function(response) {
            if (response.error)
            {
                console.log(response.error_msg);
            }
            else
            {
                $softwareUpdatesAvailable.prepend(response.update_message).show();

                if (response.update_count > 0)
                {
                    $distUpgradeNote.show(0);
                }

                if (response.is_reboot_required)
                {
                    $rebootRequired.show();
                }

                $softwareUpdatesContainer.show(200);
            }
        }
    });

//======================================================================================================================
// App versions
//======================================================================================================================

    var $appsLoadingIndicator = $('.app-applications-loading');

    ajax({
        action: 'get_app_versions',
        success: function(response) {
            if (response.error)
            {
                console.log(response.error_msg);
            }
            else
            {
                for (const [key, value] of Object.entries(response.apps))
                {
                    $('#app-application-version-' + key).html(value);
                }
            }
        },
        error: function(textStatus, error, test)
        {
            ajaxLogError(textStatus, error);
        },
        complete: function()
        {
            $appsLoadingIndicator.hide();
        }
    });


//======================================================================================================================
// Service status
//======================================================================================================================

    // Refresh on startup.
    updateServiceStatus();

    // Continue to call the update.
    var serviceStatusTimer = setInterval(updateServiceStatus, 30000);


    function updateServiceStatus()
    {
        let $loadingIndicator = $('.app-service-status-loading');
        let $loadingIndicatorItems = $('.app-service-status-item-loading');
        let $serviceItems = $(".app-service-status-item");

        let ports = $serviceItems.map(function() {
            return [{
                port: $(this).data("port"),
                protocol: $(this).data("protocol")
            }];
        }).get();

        if (ports.length === 0)
        {
            return;
        }

        ajax({
            action: 'get_service_status',
            data: {
                ports: ports
            },
            success: function(response)
            {
                $serviceItems.each(function() {
                    let $this = $(this);
                    let $online = $this.find('.app-service-status-item-online');
                    let $offline = $this.find('.app-service-status-item-offline');
                    let port = $this.data('port');

                    if (port in response.ports)
                    {
                        if (response.ports[port])
                        {
                            $online.show();
                            $offline.hide();
                        }
                        else
                        {
                            $online.hide();
                            $offline.show();
                        }
                    }
                });
            },
            error: function(jqXHR, textStatus, error)
            {
                ajaxLogError(textStatus, error);

                $('#app-service-status-content').hide();
                $('#app-service-status-error').show();

                const errorMessage = jqXHR.responseJSON?.error_msg || 'AJAX_ERROR';
                $('#app-service-status-error').html(errorMessage);

                clearInterval(serviceStatusTimer);
            },
            beforeSend: function()
            {
                $loadingIndicator.show();
            },
            complete: function()
            {
                $loadingIndicator.hide();
                // They are only used on initial page load.
                $loadingIndicatorItems.hide();
            }
        });
    }

//======================================================================================================================
// Service status
//======================================================================================================================

    function updateUsageSection($free, $used, $reserve, $total, $indicator, data) {
        $free.text(data.free);
        $used.text(data.used);
        if ($reserve)
        {
            $reserve.text(data.reserve);
        }
        $total.text(data.total);

        const formatted = data.percent_formatted;
        const loadLevel = data.percent <= 79 ? 'low' : data.percent <= 89 ? 'medium' : 'high';

        $indicator.find('progress')
                .val(data.percent)
                .text(formatted)
                .attr('data-load-level', loadLevel);
        $indicator.find('.level > .level-right > .level-item').text(formatted);

        if ($indicator[0]._tippy)
        {
            $indicator[0]._tippy.setContent(formatted);
        }

        $indicator.attr('data-tippy-content', formatted);
    }

    const $serverUtilizationLoading = $('.app-server-utilization-loading');

    const $uptimeDaysValue = $('#app-uptime-days');
    const $uptimeHoursValue = $('#app-uptime-hours');
    const $uptimeMinutesValue = $('#app-uptime-minutes');
    const $processCount = $('#app-process-count');
    const $emailsInQueue = $('#app-emails-in-queue');

    const $cpuLoad = $('.cpu-load');
    const $cpuLoadPercent = $cpuLoad.find('.app-cpu-load-percent');
    const $cpuLoad1 = $cpuLoad.find('.app-cpu-load-1');
    const $cpuLoad5 = $cpuLoad.find('.app-cpu-load-5');
    const $cpuLoad15 = $cpuLoad.find('.app-cpu-load-15');

    const $memoryFree = $('#app-memory-free');
    const $memoryUsed = $('#app-memory-used');
    const $memoryTotal = $('#app-memory-total');
    const $memoryUsageIndicator = $memoryFree.closest('td').find('.usage-indicator');

    const $swapFree = $('#app-swap-free');
    const $swapUsed = $('#app-swap-used');
    const $swapTotal = $('#app-swap-total');
    const $swapUsageIndicator = $swapFree.closest('td').find('.usage-indicator');

    // Refresh on startup.
    updateServerUtilization();
    // Continuously call the update function.
    const serverUtilizationTimer = setInterval(updateServerUtilization, 15000);

    function updateServerUtilization()
    {
        ajax({
            action: 'get_server_utilization',
            success: function(response)
            {
                $uptimeDaysValue.text(response.uptime.days);
                $uptimeHoursValue.text(response.uptime.hours);
                $uptimeMinutesValue.text(response.uptime.minutes);
                $processCount.text(response.process_count);
                $emailsInQueue.text(response.emails_in_queue);

                $cpuLoad.attr('data-load-level', response.load.level);
                $cpuLoadPercent.text(response.load.percent);
                $cpuLoad1.text(response.load.minute_1);
                $cpuLoad5.text(response.load.minute_5);
                $cpuLoad15.text(response.load.minute_15);

                updateUsageSection($memoryFree, $memoryUsed, null, $memoryTotal, $memoryUsageIndicator, response.memory);

                if (response.swap.length !== 0)
                {
                    updateUsageSection($swapFree, $swapUsed, null, $swapTotal, $swapUsageIndicator, response.swap);
                }

                for (i = 0; i < response.disks.length; i++)
                {
                    let disk = response.disks[i];
                    let $row =  $('tr[data-mount="' + disk.mount + '"]');
                    let $diskFree = $row.find('.app-disk-free');
                    let $diskUsed = $row.find('.app-disk-used');
                    let $diskReserve = $row.find('.app-disk-reserve');
                    let $diskTotal = $row.find('.app-disk-total');
                    let $diskIndicator = $row.find('.usage-indicator');

                    updateUsageSection($diskFree, $diskUsed, $diskReserve, $diskTotal, $diskIndicator, disk);
                }
            },
            error: function(jqXHR, textStatus, error)
            {
                const errorMessage = jqXHR.responseJSON?.error_msg || 'AJAX_ERROR';
                console.log(errorMessage);

                clearInterval(serverUtilizationTimer);
            },
            beforeSend: function()
            {
                $serverUtilizationLoading.show();
            },
            complete: function()
            {
                $serverUtilizationLoading.hide();
            }
        });
    }

//======================================================================================================================
// Resource charts
//======================================================================================================================

    var canvas = $('.app-chart');
    var isDark = hash['theme.is_dark_mode'];

    canvas.each(function() {
        var config = $(this).data('chart');
        var colors = ['#3273DC', '#23D160', '#FF2B56', '#FFAA00', (isDark ? '#3D3D3D' : '#CCCCCC')];
        var eData = config.data.map(function(v, i) {
            return { value: v, name: config.labels[i], itemStyle: { color: colors[i] } };
        });

        echarts.init(this).setOption({
            backgroundColor: 'transparent',
            tooltip: { trigger: 'item', formatter: '{b}: {d}%' },
            series: [{
                type: 'pie',
                radius: ['45%', '72%'],
                itemStyle: {
                    borderRadius: 6,
                    borderColor: isDark ? '#222' : '#fff',
                    borderWidth: 2
                },
                label: { show: false },
                emphasis: { label: { show: true, fontSize: 13, fontWeight: 'bold' } },
                data: eData
            }]
        });
    });