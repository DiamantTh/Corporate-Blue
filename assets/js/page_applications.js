//======================================================================================================================
// Action: index
//======================================================================================================================

    if (typeof reloadCache !== 'undefined' && reloadCache)
    {
        var $loadingAnimation = $('#app-loading-container');
        var $loadingError     = $('#app-loading-error');
        var $loadingErrorMsg  = $('#app-loading-error-message');
        var $loadingSuccess   = $('#app-loading-success');

        ajax({
            action: 'load_applications',
            success: function(response)
            {
                if (response.error)
                {
                    $loadingError.show();
                    $loadingErrorMsg.html(response.error_msg.replace(/\n/, '<br>'));
                }
                else
                {
                    location.reload(true);
                    $loadingSuccess.show();
                }
            },
            error: function(textStatus, error)
            {
                $loadingError.show();
                $loadingErrorMsg.html('AJAX_ERROR');
                ajaxLogError(textStatus, error);
            },
            beforeSend: function()
            {
                $loadingSuccess.hide();
                $loadingError.hide();
                $loadingErrorMsg.html('');
            },
            complete: function()
            {
                $loadingAnimation.hide();
            }
        });
    }


    // Show items based on the selected category.
    $('.button[data-show-category]').click(function() {
        var $this = $(this);
        var category = $this.data('show-category');

        $('div[data-category]').hide();

        if (category === 'all')
        {
            $('div[data-category]').fadeIn(200);
        }
        else
        {
            $('div[data-category="' + category + '"]').fadeIn(200);
        }
    });


    // Reveal password
    $('.app-reveal-password').click(function() {
        let $this = $(this);
        let $message =  $this.closest('.message');
        let $copyButton = $message.find('.app-copy-password');
        let $password =$message.find('.app-password');
        let idBackgroundTask = $this.data('id-background-task');

        ajax({
            action: 'reveal_application_password',
            data: {
                id_background_task: idBackgroundTask
            },
            success: function(response)
            {
                $password.text(response['password']);
            },
            error: function(textStatus, error)
            {
                $password.html('AJAX_ERROR');
                ajaxLogError(textStatus, error);
            },
            beforeSend: function()
            {
                $message.addClass('is-loading');
            },
            complete: function()
            {
                $message.removeClass('is-loading');
                $this.hide();
                $copyButton.show();
            }
        });
    });


    // Copy password
    $('.app-copy-password').click(function() {
        let $this = $(this);
        let $password = $this.closest('.message').find('.app-password');
        let result = copyToClipboard($password);
        
        animateButton($this, result);
    });
