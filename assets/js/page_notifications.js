var action = getUrlQueryParameterValue(window.location.href, 'action');
action = ['add', 'edit', 'general_settings'].indexOf(action) >= 0 ? action : 'index';

//======================================================================================================================
// Index
//======================================================================================================================

if (action === 'index')
{
    // Edit notification settings
    $('.app-edit-notification').on('click', function() {
        var $this = $(this);
        var $modal = $('#app-modal-notification-settings');
        var $form = $modal.closest('form');
        var $tr = $this.closest('tr');

        // Update inputs.
        var selectors = ['event_type', 'event_label', 'is_enabled', 'copy_email_addresses'];

        for (var i = 0; i < selectors.length; i++)
        {
            var selector = 'input[name="' + selectors[i] + '"], select[name="' + selectors[i] + '"]';
            var value = $tr.find(selector).val();

            if (selectors[i] === 'event_label')
            {
                $modal.find('#app-event-label p').html(value);
            }
            else if (selectors[i] === 'is_enabled')
            {
                $form.find(selector).prop('checked', value);
            }
            else
            {
                $form.find(selector).val(value);
            }
        }

        $modal.addClass('is-active');
    });

    // Reset notification settings
    $('.app-reset-all, .app-reset-notification').on('click', function() {
        var $this = $(this);
        var $modal = $('#app-modal-reset-settings');
        var $eventType = $modal.closest('form').find('input[name="event_type"]');

        var value = $this.hasClass('app-reset-all') ? 'all' : $this.closest('tr').find('input[name="event_type"]').val();

        $eventType.val(value);
        $modal.addClass('is-active');
    });

    // Delete custom message
    $('body').on('click', '.app-modal-delete-custom-message', function() {
        var $this = $(this);
        var $tr = $this.closest('tr');
        var $modal = $('#app-modal-delete-custom-message');
        var $eventType = $modal.closest('form').find('input[name="event_type"]');
        var $language = $modal.closest('form').find('input[name="language"]');

        $eventType.val($tr.find('input[name="event_type"]').val());
        $language.val($tr.find('input[name="language"]').val());

        $modal.addClass('is-active');
    });
}

//======================================================================================================================
// Add + Edit
//======================================================================================================================

if (action === 'add' || action === 'edit')
{
    // Load default message
    $('#app-load-default-message').click(function() {
        var $this = $(this);
        var $subject = $('input[name="subject"]');
        var $body = $('textarea[name="body"]');
        var eventType = $('input[name="event_type"]').length ?
                $('input[name="event_type"]').val() : $('select[name=event_type]').val();
        var language = $('input[name="language"]').length ?
                $('input[name="language"]').val() : $('select[name=language]').val();

        ajax({
            action: 'get_default_email_message',
            data: {
                language: language,
                event_type: eventType
            },
            success: function(data)
            {
                if (data.error)
                {
                    console.log(data.error_msg);
                }

                $subject.val(data.subject);
                $body.val(data.body);
                // Trigger auto resize.
                $body.trigger('input');
            },
            error: function(textStatus, error)
            {
                ajaxLogError(textStatus, error);
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

    // Send test email
    $('.app-send-test-email').click(function() {
        var $this = $(this);
        var $error= $('#app-send-test-error');
        var $errorMessage = $('#app-send-test-error-message');

        ajax({
            action: 'send_test_email',
            data: {
                recipients: $('input[name="test_recipients"]').val(),
                subject   : $('input[name="subject"]').val(),
                body	  : $('textarea[name="body"]').val(),
                language  : $('input[name="language"]').val(),
                is_html   : false
            },
            success: function(data)
            {
                animateButton($this, !data.error);

                if (data.error)
                {
                    $errorMessage.html(data.error_msg);
                    $error.show();
                }
            },
            beforeSend: function()
            {
                $error.hide();
                $this.addClass('is-loading');
            },
            complete: function()
            {
                $this.removeClass('is-loading');
            }
        });
    });

    // Show placeholders according to selected event.
    var $placeholders = $('.app-non-default-placeholder');
    $('input[name="event_type"], select[name=event_type]').on('change', function() {
        var $this = $(this);
        var eventType = $this.val();

        $placeholders.each(function() {
            var $this = $(this);
            var showPlaceholder = $this.data('events').split(',').indexOf(eventType) !== -1;

            showPlaceholder ? $this.show() : $this.hide();
        });
    }).trigger('change');
}

//======================================================================================================================
// General settings
//======================================================================================================================

if (action === 'general_settings')
{
    var $smtpSettings = $('#app-smtp-settings');
    var requiredInputsSelector = 'input[name="smtp_host"], input[name="smtp_port"]';

    $('input[name="use_smtp"]').change(function(){
        var $this = $(this);

        if ($this.is(':checked'))
        {
            $smtpSettings.find(requiredInputsSelector).prop('required', true);
            $smtpSettings.show();
        }
        else
        {
            $smtpSettings.find(requiredInputsSelector).prop('required', false);
            $smtpSettings.hide();
        }
    }).trigger('change');


    // Test webhook URL

    $('.app-test-webhook').click(function() {
        var $this = $(this);
        var $error = $('#app-test-webhook-error');
        var $errorMessage = $('#app-test-webhook-error-message');

        ajax({
            action: 'test_webhook',
            data: {
                webhook_url	: $('input[name=webhook_url]').val()
            },
            success: function(data)
            {
                animateButton($this, !data.error);

                if (data.error)
                {
                    $errorMessage.html(data.error_msg);
                    $error.show();
                }
            },
            beforeSend: function()
            {
                $error.hide();
                $this.addClass('is-loading');
            },
            complete: function()
            {
                $this.removeClass('is-loading');
            }
        });
    });
}