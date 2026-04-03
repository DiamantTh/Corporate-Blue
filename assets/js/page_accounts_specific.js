//----------------------------------------------------------------------------------------------------------------------
// Show / hide send login credentials checkbox
//----------------------------------------------------------------------------------------------------------------------

var $sendLoginCredentials = $('#app-send-login-credentials');
var $inputEmail = $('#input-email');
var $inputPassword = $('#input-password');

$inputEmail.on('input', function() {
    setSendLoginCredentialsVisibility();
});

$inputPassword.on('input, change', function() {
    setSendLoginCredentialsVisibility();
});

function setSendLoginCredentialsVisibility()
{
    if ($inputEmail.val().length > 0 && $inputPassword.val().length)
    {
        $sendLoginCredentials.show(200);
    }
    else
    {
        $sendLoginCredentials.hide(200);
    }
}

//----------------------------------------------------------------------------------------------------------------------
// Account template
//----------------------------------------------------------------------------------------------------------------------

var $applyAccountTemplate = $('#app-apply-account-template');

$applyAccountTemplate.click(function() {
    let $this = $(this);
    let accountTemplateId = $('#input-account_template').val();

    ajax({
        action: 'get_account_template',
        data: {
            account_template_id: accountTemplateId
        },
        success: function(response)
        {
            let isSuccess = false;

            if (!response.error)
            {
                isSuccess = true;
                for (var key in response.template)
                {
                    var value = response.template[key];

                    var $element = $('[name="' + key + '"]');

                    if ($element.length === 0)
                    {
                        continue;
                    }

                    var tag  = $element.prop('tagName').toLowerCase();
                    var type = $element.prop('type').toLowerCase();

                    if (type === 'radio')
                    {
                        $element.val([value]).trigger('change');
                    }
                    else if (type === 'checkbox')
                    {
                        $element.prop('checked', (value === '1' || value === true));
                    }
                    else if (tag === 'input')
                    {
                        // input could have types like 'email', 'number' and so on,
                        // so check this more generic input fields below radio / checkbox!

                        var $unlimited = $('[name="' + key + '_ul"]');

                        if ($unlimited.length > 0)
                        {
                            // fields with unlimited checkbox

                            $unlimited.prop('checked', value === '-1').trigger('change');
                            $element.val(value === '-1' ? '0' : value);
                        }
                        else
                        {
                            // normal input, nothing fancy

                            $element.val(value);
                        }
                    }
                    else if (tag === 'textarea')
                    {
                        $element.val(value);
                    }
                    else
                    {
                        console.log('unhandled key: ' + key);
                    }

                    // update multiplier field
                    if (key === 'disk_space' || key === 'traffic')
                    {
                        var $multiplier = $('[name="' + key + '_multiplier"]');

                        var optionValues = [];
                        $multiplier.children().each(function() {
                            optionValues.push(this.value);
                        });

                        var base = optionValues[1];

                        if (value === '-1')
                        {
                            value = base * base;
                        }

                        if (value === '0' || value === '')
                        {
                            $multiplier.val(1);
                        }
                        else
                        {
                            optionValues.reverse();

                            for (var i = 0; i < optionValues.length; i++)
                            {
                                if (value % optionValues[i] === 0)
                                {
                                    $element.val(value / optionValues[i]);
                                    $multiplier.val(optionValues[i]);
                                    break;
                                }
                            }
                        }
                    }
                }
            }

            animateButton($this, isSuccess);
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

//----------------------------------------------------------------------------------------------------------------------
// Show warning when disabling backup
//----------------------------------------------------------------------------------------------------------------------

if ($('form').prop('action').indexOf('action=edit') !== -1)
{
    var $backupCheckbox = $('input[name="backup"]');
    var backupDeletionWarningTemplate = Handlebars.compile($('#app-backup-deletion-warning-template').html());

    if ($backupCheckbox.prop('checked'))
    {
        $backupCheckbox.change(function() {
            if ($backupCheckbox.prop('checked'))
            {
                $('#app-backup-deletion-warning').remove();
            }
            else
            {
                $backupCheckbox.closest('.control').append(backupDeletionWarningTemplate());
            }
        });
    }
}

//----------------------------------------------------------------------------------------------------------------------
// Country list
//----------------------------------------------------------------------------------------------------------------------

    // Hidden select2 elements will be initialized with only the minimum of width.
    // So we just initialize the element, when the corresponding tab gets visible.
    $('.tabs a[href="#tab-contact-data"]').on('click', function() {
        select2_prepareSelect('#input-country');
    });
