//======================================================================================================================
// Meta
//======================================================================================================================

    var action = $('form').prop('action').indexOf('action=add') !== -1 ? 'add' : 'edit';
    var area = hash['app.area'] === 'admin' ? 'admin' : 'client';

//======================================================================================================================
// General
//======================================================================================================================

    // Show/Hide domain target settings
    $('input[name="target_type"]').on('change', function() {
        var $this = $(this);
        var $showWithDirectory = $('#app-show-with-directory');
        var $showWithUrl = $('#app-show-with-url');
        var $urlInput = $showWithUrl.find('input[name="url"]');

        if ($this.is(':checked'))
        {
            if ($this.val() === 'directory')
            {
                $showWithDirectory.show(200);
                $showWithUrl.hide(200);

                // If someone enters text that does not match the browser check "url",
                // the field would generate a browser validation error,
                // but if it is hidden, it would not be seen and the form would not submit.
                $urlInput.attr('type', 'text');
            }
            else
            {
                $showWithDirectory.hide(200);
                $showWithUrl.show(200);

                // See comment above.
                $urlInput.attr('type', 'url');
            }
        }
    }).trigger('change');

    // Show/Hide security options based on the certificate type
    $('input[name="certificate_type"]').on('change', function() {
        var $this = $(this);
        var $showWithTypeCustom = $('#app-show-with-type-custom');
        var $showWithCertificate = $('#app-show-with-certificate');

        if ($this.is(':checked'))
        {
            if ($this.val() === 'lets_encrypt' || $this.val() === 'custom')
            {
                $showWithCertificate.show(200);
            }
            else
            {
                $showWithCertificate.hide(200);
            }

            if ($this.val() === 'custom')
            {
                $showWithTypeCustom.show(200);
            }
            else
            {
                $showWithTypeCustom.hide(200);
            }
        }
    }).trigger('change');

    // Show/Hide CGI options
    $('input[name="cgi_path_type"]').on('change', function() {
        var $this = $(this);
        var $showWithCgiPathTypeCustom = $('#app-show-with-cgi-path-type-custom');

        if ($this.val() === 'custom' && $this.is(':checked'))
        {
            $showWithCgiPathTypeCustom.show(200);
        }
        else
        {
            $showWithCgiPathTypeCustom.hide(200);
        }
    }).trigger('change');

    // Show/Hide additional email settings
    toggleVisibilityByCheckbox('input[name="is_email_domain"]', '.app-show-with-email-domain');

//======================================================================================================================
// Admin area | CodeMirror
//======================================================================================================================

    if (area === 'admin')
    {
        // Init CodeMirror
        var apacheHttpEditor = initCodemirror($('textarea[name="apache_http_directives"]')[0], '24.5em');
        var apacheHttpsEditor = initCodemirror($('textarea[name="apache_https_directives"]')[0], '24.5em');

        // When CodeMirror is created within a hidden element, it needs to be refreshed.
        // We need to observe, if the class of the parent tab changes to is-active.
        const $apacheTab = $('#tab-apache-settings')[0];

        var observerCallback = function(mutationsList) {
            mutationsList.forEach(function(mutation) {
                if (mutation.attributeName === 'class')
                {
                    apacheHttpEditor.refresh();
                    apacheHttpsEditor.refresh();
                }
            });
        };

        var observer = new MutationObserver(observerCallback);
        observer.observe($apacheTab, { attributes: true, attributeFilter: ['class'] });
    }

//======================================================================================================================
// Only add
//======================================================================================================================

    if (action === 'add')
    {
        // Common elements
        var $domainType = $('input[name="domain_type"]');
        var $domainMain = $('input[name="domain_main"]');
        var $domainSubdomain = $('input[name="domain_subdomain"]');
        var $mainDomainId = $('select[name="main_domain_id"]');
        var $path = $('input[name="path"]');

        // Show/Hide domain name input variants
        $domainType.on('change', function() {
            var $this = $(this);

            var $showWithMainDomain = $('.app-show-with-main-domain');
            var $showWithSubdomain = $('.app-show-with-subdomain');
            var $createWwwSubdomain = $('#app-create-www-subdomain');
            // Only admin
            var $isEmailDomain = $('input[name="is_email_domain"]');
            var $isEmailSendingOnly = $('input[name="is_email_sending_only"]');

            if ($this.is(':checked'))
            {
                if ($this.val() === 'main_domain')
                {
                    $showWithMainDomain.show(200);
                    $showWithSubdomain.hide(200);
                    $createWwwSubdomain.show(200);

                    if (area === 'admin')
                    {
                        $isEmailDomain.prop('checked', true).trigger('change');
                    }
                }
                else if ($this.val() === 'subdomain')
                {
                    $showWithMainDomain.hide(200);
                    $showWithSubdomain.show(200);
                    $createWwwSubdomain.hide(200);

                    if (area === 'admin')
                    {
                        $isEmailDomain.prop('checked', false).trigger('change');
                        $isEmailSendingOnly.prop('checked', false);
                    }
                }
            }
        }).trigger('change');

        // Update PHP version, when switching to domain type subdomain
        var $phpInterpreter = $('select[name="php_interpreter"]');
        if ($phpInterpreter.length)
        {
            var initialPhpVersion = $phpInterpreter.val();

            $domainType.on('change', function() {
                var $this = $(this);

                if ($this.is(':checked'))
                {
                    if ($this.val() === 'subdomain')
                    {
                        initialPhpVersion = $phpInterpreter.val();
                        $phpInterpreter.val(['like_main']);
                    }
                    else
                    {
                        $phpInterpreter.val([initialPhpVersion]);
                    }
                }
            });
        }

        // Suggest target directory
        var $elements = $domainType.add($domainMain).add($domainSubdomain).add($mainDomainId);

        $elements.on('change keyup', function() {
            var domain_type = $domainType.filter(':checked').val();
            var directory = '';

            if (domain_type === 'main_domain')
            {
                directory += $domainMain.val();
            }
            else
            {
                directory += $domainSubdomain.val();
                if ($mainDomainId.val() > 0)
                {
                    directory += '.' + $mainDomainId.find('option:selected').text();
                }
            }

            // Sanitize
            directory = directory.replace(/\s+/g, '');
            directory = directory.toLowerCase();

            directory = directory === '' ? '/' : '/' + directory + '/';
            $path.val(directory);
        });
    }