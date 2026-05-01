//======================================================================================================================
// Show / Hide rotation mode settings
//======================================================================================================================

    toggleVisibilityBySelect('select[name="rotation_mode"]', {
        'by_count': '#app-rotation-by-count',
        'by_time':  '#app-rotation-by-time',
    });

    toggleVisibilityByCheckbox('input[name="time_period_daily"]',   '#app-rotation-daily-count');
    toggleVisibilityByCheckbox('input[name="time_period_weekly"]',  '#app-rotation-weekly-count');
    toggleVisibilityByCheckbox('input[name="time_period_monthly"]', '#app-rotation-monthly-count');
    toggleVisibilityByCheckbox('input[name="time_period_yearly"]',  '#app-rotation-yearly-count');

//======================================================================================================================
// Select backup storage type
//======================================================================================================================

    $('select[name="storage_type"]').on('change', function() {
        var $this           = $(this);
        var allElements     = $('.app-storage-settings');
        var selectedElement = $('.app-storage-settings[data-storage-type="' + $this.val() + '"]');

        allElements.hide();
        allElements.find('input[required], textarea[required]').addClass('app-toggle-required').prop('required', false);

        selectedElement.show(200);
        selectedElement.find('.app-toggle-required').prop('required', true);
    }).trigger('change');

//======================================================================================================================
// SFTP + Keydisc
//======================================================================================================================

    // Select auth method.
    $('select[name$="_auth_method"]').on('change', function() {
        var $this            = $(this);
        var $wrapper         = $this.closest('.app-storage-settings');
        var storageType      = $wrapper.data('storage-type');
        var $allElements     = $wrapper.find('.app-auth-password, .app-auth-key');
        var $selectedElement = $wrapper.find('.app-auth-' + $this.val());        // For reference: .app-auth-password, .app-auth-key

        if ($('select[name="storage_type"]').val() !== storageType)
        {
            return;
        }

        $allElements.hide();
        $allElements.find('input[required]').addClass('app-toggle-required').prop('required', false);

        $selectedElement.show(200);
        $selectedElement.find('.app-toggle-required').prop('required', true);
    }).trigger('change');

    // Show public key or 'create public key' button. For reference: sftp_public_key, keydisc_public_key
    $('input[name$="_public_key"]').on('change', function() {
        var $this         = $(this);
        var $wrapper      = $this.closest('.app-auth-key');
        var $keyExists    = $wrapper.find('.app-auth-key-exists');
        var $keyNotExists = $wrapper.find('.app-auth-key-not-exists');

        $keyExists.hide();
        $keyNotExists.hide();

        $this.val() === '' ? $keyNotExists.show(200) : $keyExists.show(200);
    }).trigger('change');

    // Create key pair.
    $('.app-auth-key-create').on('click', function() {
        var $this       = $(this);
        var $wrapper    = $this.closest('.app-auth-key');
        var $publicKey  = $wrapper.find('input[name$="_public_key"]');  // For reference: sftp_public_key, keydisc_public_key
        var $privateKey = $wrapper.find('input[name$="_private_key"]'); // For reference: sftp_private_key, keydisc_private_key

        ajax({
            action: 'generate_key_pair',
            success: function(data)
            {
                publicKey  = data.error === false ? data.public_key : 'ERROR';
                privateKey = data.error === false ? data.private_key : '';

                // Without trigger, on change won't fire on hidden elements.
                $publicKey.val(publicKey).trigger('change');
                $privateKey.val(privateKey);
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
    });

    // Remove key pair.
    $('.app-auth-key-remove').on('click', function() {
        var $this       = $(this);
        var $wrapper    = $this.closest('.app-auth-key');
        var $publicKey  = $wrapper.find('input[name$="_public_key"]');  // sftp_public_key, keydisc_public_key
        var $privateKey = $wrapper.find('input[name$="_private_key"]'); // sftp_private_key, keydisc_private_key

        // Wihtout trigger, on-change won't fire on hidden elements.
        $publicKey.val('').trigger('change');
        $privateKey.val('');
    });

//======================================================================================================================
// Save form
//======================================================================================================================

    $('#form-repository-settings').submit(function() {
        $('#app-modal-save-settings').addClass('is-active');
    });
