//======================================================================================================================
// Update textarea to WYSIWYG
//======================================================================================================================

    initTrumbowygEditor('textarea[name="body"]');

//======================================================================================================================
// Send test email
//======================================================================================================================

    $('.app-send-test-email').click(function() {
        var $this = $(this);
        var $error = $('#app-send-test-error');
        var $errorMessage = $('#app-send-test-error-message');

        ajax({
            action: 'send_test_email',
            data: {
                recipients	: $('input[name=test_recipients]').val(),
                subject		: $('input[name=subject]').val(),
                body		: $('textarea[name=body]').val(),
                is_html     : true
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