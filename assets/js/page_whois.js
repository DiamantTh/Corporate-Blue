var $input = $('input[name="ip_address"]');
var $button = $('.app-perform-lookup');

var $resultContainer = $('#app-result-container');
var $result = $('#app-result');

var $errorContainer = $('#app-error-container');
var $error = $('#app-error');

// Hit [Enter] -> Trigger button click
$input.keypress(function (e) {
    var key = e.which;
    if(key == 13)  // The [ENTER] key code.
    {
        $button.click();
        return false;
    }
});

// Perform Ajax and take results.
$button.click(function () {
    var ipAddress =  $input.val();

    ajax({
        action: 'query_whois',
        data: {
            ip_address: ipAddress
        },
        success: function(response)
        {
            if (response.error)
            {
                $errorContainer.show();
                $error.html(response.error_msg);

                $resultContainer.hide();
            }
            else
            {
                $result.html(response.whois);
            }
        },
        error: function(textStatus, error)
        {
            $errorContainer.show();
            $error.html('AJAX_ERROR');

            $resultContainer.hide();
            ajaxLogError(textStatus, error);
        },
        beforeSend: function()
        {
            $errorContainer.hide();

            $resultContainer.show();
            $result.text("\n\n\n\n");
            $result.addClass('is-loading');
        },
        complete: function()
        {
            $result.removeClass('is-loading');
        }
    });
});
