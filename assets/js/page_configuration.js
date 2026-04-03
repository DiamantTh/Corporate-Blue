var configureParameter = getUrlQueryParameterValue(window.location.href, 'configure');

//======================================================================================================================
// DNS server
//======================================================================================================================

    if (configureParameter === 'dns_server')
    {
        var $nameServerContainer = $('#app-name-server-container');
        var nameServerTemplate = Handlebars.compile($('#app-name-server-template').html());

        // On startup.
        for (var i = 0; i < nameServers.length; i++)
        {
            addNameServer(nameServers[i]);
        }

        // On `add` button click.
        $('#app-add-name-server').click(function() {
             addNameServer('');
        })

        // On `remove` button click.
        $nameServerContainer.on('click', '.app-remove-name-server', function() {
            $(this).closest('.app-name-server-item').remove();
        });

        function addNameServer(name)
        {
            var $html = $(nameServerTemplate());
            $html.find('input').val(name);
            $nameServerContainer.append($html);
        }
    }

//======================================================================================================================
// Email server
//======================================================================================================================

    if (configureParameter === 'email_server')
    {
       toggleVisibilityByRadioButton('input[name="connection_data_type"]', {
           custom_domain: '#app-show-with-use-custom-domain'
       });
    }

//======================================================================================================================
// PHP Interpreter
//======================================================================================================================

    // load available interpreter
    $('#app-load-interpreters').on('click', function() {
        var $this = $(this);

        var $interpreterNotAvailable = $('#app-interpreter-not-available');
        var $interpreterError        = $('#app-interpreter-error');
        var $interpreterErrorMsg     = $('#app-interpreter-error-message');

        var $interpreterTable        = $('#app-interpreter-table');
        var $interpreterTbody        = $('#app-interpreter-tbody');
        var $interpreterCount        = $('#app-interpreter-count');

        var $ajaxFinished            = $('input[name="ajax_finished"]');
        var scheduledInstalls        = $('input[name="scheduled_installs"]').val();
        var interpreterTemplate      = Handlebars.compile($('#app-interpreter-template').html());

        $ajaxFinished.val(0);

        ajax({
            action: 'get_available_php_interpreters',
            success: function(response)
            {
                $interpreterNotAvailable.hide();
                $interpreterError.hide();
                $interpreterTable.hide();

                if (response.error)
                {
                    $interpreterErrorMsg.html(nl2br(response.error_msg));
                    $interpreterError.show(200);
                }
                else
                {
                    if (response.items.length === 0)
                    {
                        $interpreterNotAvailable.show(200);
                    }
                    else
                    {
                        $interpreterTbody.html('');

                        for (var i = 0; i < response.items.length; i++)
                        {
                            var item = response.items[i];
                            item.is_scheduled = scheduledInstalls.indexOf(item.main_version) > -1;
                            $interpreterTbody.append(interpreterTemplate(item));
                        }

                        $interpreterCount.html(response.items.length);
                        $interpreterTable.show(200);
                    }
                }
            },
            error: function(textStatus, error)
            {
                $interpreterErrorMsg.html('AJAX_ERROR');
                $interpreterError.show();
                ajaxLogError(textStatus, error);
            },
            beforeSend: function()
            {
                $this.addClass('is-loading');
            },
            complete: function()
            {
                $ajaxFinished.val(1);
                $this.removeClass('is-loading');
            }
        });
    }).trigger('click');

//======================================================================================================================
// Patch Manager
//======================================================================================================================

    // load available interpreter
    $('#app-refresh-patch-list').on('click', function() {
        const $this = $(this);

        const $noPatchesAvailable       = $('#app-no-patches-available');
        const $patchTable               = $('#app-patch-table');
        const $patchManagerError        = $('#app-patch-manager-error');
        const $patchManagerErrorMessage = $('#app-patch-manager-error-message');
        const $patchList                = $('#app-patch-list');
        const $patchCount               = $('#app-patch-count');
        const patchTemplate             = Handlebars.compile($('#app-patch-template').html());

        ajax({
            action: 'get_patch_list',
            success: function(response)
            {
                $noPatchesAvailable.hide();
                $patchManagerError.hide();
                $patchTable.hide();
                $patchList.html('');

                if (response.items.length === 0)
                {
                    $noPatchesAvailable.show(200);
                    return;
                }

                for (var i = 0; i < response.items.length; i++)
                {
                    var item = response.items[i];
                    $patchList.append(patchTemplate(item));
                }

                // Init dynamic tooltips
                tippy('#app-patch-list .app-tooltip', tippySettingsTooltip);

                $patchCount.html(response.items.length);
                $patchTable.show(200);
            },
            error: function(jqXHR, textStatus, error)
            {
                const errorMessage = jqXHR.responseJSON?.error_msg || 'AJAX_ERROR';
                ajaxLogError(textStatus, error);

                $patchManagerError.show();
                $patchManagerErrorMessage.html(errorMessage);
            },
            beforeSend: function()
            {
                $this.addClass('is-loading');
            },
            complete: function()
            {
                $this.removeClass('is-loading');
            }
        });
    }).trigger('click');

//======================================================================================================================
// RAM drive
//======================================================================================================================

    var isTmpSelector    = 'input[type="checkbox"][name="is_tmp"]';
    var isVarTmpSelector = 'input[type="checkbox"][name="is_var_tmp"]';

    $(isTmpSelector + ', ' + isVarTmpSelector).on('change', function() {
        var $showWithEnabled = $('#app-show-with-enabled');
        var isEnabled = false;

        $(isTmpSelector + ', ' + isVarTmpSelector).each(function() {
            var $this = $(this);

            if ($this.prop('checked'))
            {
                isEnabled = true;
            }
        });

        if (isEnabled)
        {
            $showWithEnabled.show(200);
        }
        else
        {
            $showWithEnabled.hide(200);
        }
    }).trigger('change');


//======================================================================================================================
// Login & sessions
//======================================================================================================================

    var administrativeAccessBehavior = $('input[type="radio"][name="administrative_access_behavior"]');

    $('textarea[name="administrative_access"]').on('input', function() {
        var $this = $(this);

        if ($this.val().trim() !== '')
        {
            administrativeAccessBehavior.prop('disabled', false);
        }
        else
        {
            administrativeAccessBehavior.prop('disabled', true);
        }
    }).trigger('input');

//======================================================================================================================
// TLS version and cipher
//======================================================================================================================

    if (configureParameter === 'tls_version_and_ciphers')
    {
        $('input[name="use_custom"]').on('change', function() {
            var $this = $(this);
            var $defaultContainer = $('.app-show-with-default');
            var $customContainer = $('.app-show-with-custom');

            if ($this.val() === '0' && $this.is(':checked'))
            {
                $defaultContainer.show(0);
                $customContainer.hide(0);
            }

            if ($this.val() === '1' && $this.is(':checked'))
            {
                $customContainer.show(0);
                $defaultContainer.hide(0);
            }
        }).trigger('change');
    }

//======================================================================================================================
// Applications
//======================================================================================================================

    $('input[name="is_filter_enabled"]').on('change', function() {
        var $this = $(this);
        var $applicationContainer = $('#app-application-container');

        if ($this.val() === '1' && $this.is(':checked'))
        {
            $applicationContainer.fadeIn(200);
        }
        else
        {
            $applicationContainer.fadeOut(200);
        }
    }).trigger('change');

//======================================================================================================================
// Webmail
//======================================================================================================================

    // show / hide webmail settings depending on the selected webmail client
    $('select[name="webmail_client"]').on('change', function() {
        var $this = $(this);
        var $showWithRoundcube = $('.app-show-with-roundcube');

        if ($this.val() === 'roundcube')
        {
            $showWithRoundcube.show(200);
        }
        else
        {
            $showWithRoundcube.hide(200);
        }
    }).trigger('change');


//======================================================================================================================
// Backup
//======================================================================================================================

    // show / hide settings when local repository is enabled
    $('input[name="is_local_repo_enabled"]').on('change', function() {
        var $this = $(this);
        var $showWithLocalRepo = $('.app-show-with-local-repo');

        if ($this.prop('checked'))
        {
            $showWithLocalRepo.show(200);
        }
        else
        {
            $showWithLocalRepo.hide(200);
        }
    }).trigger('change');


//======================================================================================================================
// TLS/SSL
//======================================================================================================================

    select2_prepareSelect('#input-country');

//======================================================================================================================
// Service status
//======================================================================================================================

    if (configureParameter === 'service_status')
    {
        // Global
        var $serviceContainer = $('#app-service-container');
        var serviceTemplate = Handlebars.compile($('#app-service-template').html());

        // Add services (on page load).
        for (var i = 0; i < serviceConfig.length; i++)
        {
            addService(serviceConfig[i]['name'], serviceConfig[i]['port'], serviceConfig[i]['protocol'], 'append');
        }

        // Add alias (on button click).
        $('#app-btn-add-service').on('click', function() {
            addService('', '', '', 'prepend');
        });

        // Remove service.
        $serviceContainer.on('click', '.app-btn-remove-service', function() {
            $(this).closest('.columns').remove();
        });

        // Submit
        $('form').submit(function() {
            $('input[name=service_config]').val(JSON.stringify(getCurrentServices()));
            return true;
        });

        /**
         * Adds a new service row to the container.
         *
         * @param    {string}     name
         * @param    {int}        port
         * @param    {string}     protocol
         * @param    {string}     addMethod
         * @returns  {undefined}
         */
        function addService(name, port, protocol, addMethod)
        {
            let $html = $(serviceTemplate());

            if (name)
            {
                $html.find('input[name="name"]').val(name);
            }

            if (port)
            {
                $html.find('input[name="port"]').val(port);
            }

            if (protocol)
            {
                protocol = protocol === 'udp' ? 'udp' : 'tcp';
                $html.find('select[name="protocol"]').val(protocol);
            }

            if (addMethod === 'append')
            {
                $serviceContainer.append($html);
            }
            else
            {
                $serviceContainer.prepend($html);
            }
        }

        /**
         * Returns an array of objects with all services.
         * Each object has a 'name', 'port', 'protocol' property.
         *
         * @returns  {Array}
         */
        function getCurrentServices()
        {
            let services = new Array();
            let i = 0;

            $serviceContainer.find('.columns').each(function() {
                let $this = $(this);
                let name = $this.find('input[name="name"]').val().trim();
                let port = $this.find('input[name="port"]').val().trim();
                let protocol = $this.find('select[name="protocol"]').val().trim();

                if (name && port && protocol)
                {
                    services[i] = {
                        name: name,
                        port: port,
                        protocol: protocol
                    };
                    i++;
                }
            });

            return services;
        }
    }

//======================================================================================================================
// Server Service management
//======================================================================================================================

    if (configureParameter === 'service_management')
    {
        // Globas
        const $serviceContainer = $('#app-service-container');
        const serviceTemplate = Handlebars.compile($('#app-service-template').html());

        // Add services (on page load).
        for (let i = 0; i < customServices.length; i++)
        {
            addService(customServices[i]['name'], customServices[i]['category'], customServices[i]['system_name'], 'append');
        }

        // Add alias (on button click).
        $('#app-btn-add-service').on('click', function() {
            addService('', '', '', 'prepend');
        });

        // Remove service.
        $serviceContainer.on('click', '.app-btn-remove-service', function() {
            $(this).closest('.columns').remove();
        });

        // Submit
        $('form').submit(function() {
            $('input[name=custom_services]').val(JSON.stringify(getCurrentServices()));
            return true;
        });

        /**
         * Adds a new service row to the container.
         *
         * @param    {string}     name
         * @param    {string}     category
         * @param    {string}     systemName
         * @param    {string}     addMethod
         * @returns  {undefined}
         */
        function addService(name, category, systemName, addMethod)
        {
            const $html = $(serviceTemplate());

            if (name)
            {
                $html.find('input[name="name"]').val(name);
            }

            if (category)
            {
                $html.find('input[name="category"]').val(category);
            }

            if (systemName)
            {
                $html.find('input[name="system_name"]').val(systemName);
            }

            addMethod === 'append' ? $serviceContainer.append($html) : $serviceContainer.prepend($html);
        }

        /**
         * Returns an array of objects with all services.
         * Each object has a 'name', 'category', 'system_name' property.
         *
         * @returns  {Array}
         */
        function getCurrentServices()
        {
            let services = [];
            let i = 0;

            $serviceContainer.find('.columns').each(function() {
                let $this = $(this);
                let name = $this.find('input[name="name"]').val().trim();
                let category = $this.find('input[name="category"]').val().trim();
                let systemName = $this.find('input[name="system_name"]').val().trim();

                // Category is optional.
                if (name && systemName)
                {
                    services[i] = {
                        name: name,
                        category: category,
                        system_name: systemName
                    };
                    i++;
                }
            });
            return services;
        }
    }

//======================================================================================================================
// Antivirus scanner
//======================================================================================================================

    if (configureParameter === 'av_scanner')
    {
        $('input[name="virus_signatures_type"]').on('change', function() {
            var $this = $(this);
            var $best = $('.app-show-with-best');
            var $good = $('.app-show-with-good');
            var $custom = $('.app-show-with-custom');

            if ($this.is(':checked'))
            {
                $best.hide(0);
                $good.hide(0);
                $custom.hide(0);

                switch ($this.val())
                {
                    case 'best':
                        $best.show(0);
                        break;
                    case 'good':
                        $good.show(0);
                        break;
                    case 'custom':
                        $custom.show(0);
                        break;
                }
            }

        }).trigger('change');
    }

//======================================================================================================================
// Import / Export settings
//======================================================================================================================

    if (configureParameter === 'import_export_settings')
    {
        let checkboxChecked = true
        $('.app-select-all').click(function() {
            const $this = $(this);
            const $checkboxes = $this.closest('.field').find('input[type="checkbox"]');
            $checkboxes.prop("checked", checkboxChecked);
            checkboxChecked = !checkboxChecked;
        });
    }