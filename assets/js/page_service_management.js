$('.app-service-group').each(function() {
    let $this = $(this);
    let services = [];
    let $statusElements = $this.find('*[class^="app-service-status-"]');
    let $statusLoading = $this.find('.app-service-status-loading');
    let $statusError = $this.find('.app-service-status-error');
    let $buttons = $this.find('*[class^="app-service-button-"]');

    $this.find('input[name="service"]').each(function() {
        services.push(this.value);
    });

    ajax({
        action: 'get_system_service_status',
        data: {
            services: services
        },
        success: function(response)
        {
            $statusElements.hide();
            $buttons.hide();

            for (let id in response.services)
            {
                let $tr = $('input[name="service"][value="' + id + '"]').closest('tr');
                let status = response.services[id];
                let isStopRestricted = $('input[name="service"][value="' + id + '"]').siblings('input[name="restrict_stop"]').val() === '1';
                let isRestartRestricted = $('input[name="service"][value="' + id + '"]').siblings('input[name="restrict_restart"]').val() === '1';

                switch (status)
                {
                    case 1:
                        $tr.find('.app-service-status-active').show();
                        $tr.find('.app-service-button-start-disabled').show();
                        $tr.find('.app-service-button-stop-' + (isStopRestricted ? 'no-action' : 'enabled') ).show();
                        $tr.find('.app-service-button-restart-' + (isRestartRestricted ? 'no-action' : 'enabled') ).show();
                        break;
                    case 2:
                        $tr.find('.app-service-status-inactive').show();
                        $tr.find('.app-service-button-start-enabled').show();
                        $tr.find('.app-service-button-stop-disabled').show();
                        $tr.find('.app-service-button-restart-disabled').show();
                        break;
                    case 3:
                        $tr.find('.app-service-status-unknown').show();
                        $tr.find('.app-service-button-start-no-action').show();
                        $tr.find('.app-service-button-stop-no-action').show();
                        $tr.find('.app-service-button-restart-no-action').show();
                        break;
                }
            }
        },
        error: function(textStatus, error)
        {
            $statusElements.hide();
            $statusError.show();
            ajaxLogError(textStatus, error);
        },
        beforeSend: function()
        {
            $statusElements.hide();
            $statusLoading.show();
        },
        complete: function()
        {
            $statusLoading.hide();
        }
    });
});

