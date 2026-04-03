var actionParam = getUrlQueryParameterValue(window.location.href, 'action');
var isEdit = actionParam === 'add' || actionParam === 'edit';
var isIndex = !isEdit;

//======================================================================================================================
// Index
//======================================================================================================================

if (isIndex)
{
    // Show more items (aliases / forwardings).
    $('.app-show-more-items').on('click', function() {
       var $this = $(this);

       $this.closest('td').find('ul > .is-hidden').each(function() {
           $(this).removeClass('is-hidden');
       });

       $this.remove();
    });

    // Apple QR email configuration.
    $('.app-modal-scan-qr').on('click', function() {
        var $this = $(this);
        var title = $this.closest('tr').find('td:first a').text().trim();
        var $modal = $('#app-modal-scan-qr');
        var qrValue = $this.data('url');

        console.log(qrValue);

        $modal.find('.modal-card-title').text(title);
        $modal.addClass('is-active');

        ajax({
            action: 'generate_qr',
            data: {
                value: qrValue
            },
            success: function(data)
            {
                $modal.find('.app-qr-container').html('<img src="' + data.qr + '">');
            }
        });
    });

    // Delete contents modal.
    $('.app-modal-delete-contents-trigger').on('click', function() {
        let $this = $(this);
        let $modal = $('#app-modal-delete-contents');
        let $idInput = $modal.closest('form').find('input[name="id"]');
        let id = $this.data('id');
        let $accountLabel = $modal.find('.app-account-name');
        let name = $this.data('name');

        $accountLabel.text(name);
        $idInput.val(id);
        $modal.addClass('is-active');
    });
}

//======================================================================================================================
// Add / Edit
//======================================================================================================================

if (isEdit)
{
    // Globals
    var $aliasContainer = $('#app-add-alias-container');
    var aliasTemplate = Handlebars.compile($('#app-add-alias-template').html());
    var $emailDomainSelect = $('select[name="email_domain_id"]');

    // Add | Update alias domain name
    $emailDomainSelect.on('change', function() {
        alias_email_domain = $emailDomainSelect.children(':selected').text().trim();
        $aliasContainer.find('.columns').each(function() {
            $(this).find('.button.is-static').eq(1).text(alias_email_domain);
        });
    });

    // Toggle visibility of protections
    if (!isEnableCatchallProtections)
    {
        toggleVisibilityByCheckbox('input[name="is_catch_all"]', '#app-show-without-catchall', true);
    }

    toggleVisibilityByCheckbox('input[name="is_check_for_spam"]', '#app-show-with-check-spam');

    // Add alias (on page load)
    for (var i = 0; i < aliases.length; i++)
    {
        addAlias(aliases[i], alias_email_domain, 'append');
    }

    // Add alias (on button click)
    $('#app-btn-add-alias').on('click', function() {
        addAlias('', alias_email_domain, 'prepend');
    });

    // Remove alias
    $aliasContainer.on('click', '.app-btn-remove-alias', function() {
        $(this).closest('.columns').remove();
    });

    // Submit
    $('form').submit(function() {
        $('input[name=aliases]').val(JSON.stringify(getCurrentAliases()));
        return true;
    });

    toggleVisibilityByCheckbox('input[name="is_check_for_spam"]', '#show-with-is-check-for-spam');

    toggleVisibilityByCheckbox('input[name="use_custom_scores"]', '#show-with-use-custom-scores');
    const $useCustomScores = $('input[name="use_custom_scores"]');

    $useCustomScores.on('change', function() {
        const $this = $(this);
        const $spamTagScore = $('input[name="spam_tag_score"]');
        const $spamRejectScore = $('input[name="spam_reject_score"]');

        if ($this.prop('checked'))
        {
            $spamTagScore.prop('required', true);
            $spamRejectScore.prop('required', true);
        }
        else
        {
            $spamTagScore.prop('required', false);
            $spamRejectScore.prop('required', false);
        }
    }).trigger('change');
}

//======================================================================================================================
// Functions
//======================================================================================================================

/**
 * Adds a new alias row to the container.
 *
 * @param    {string}   name
 * @param    {int}      idDomain
 * @returns  {Boolean}
 */
function addAlias(name, domain, addMethod)
{
    var $html  = $(aliasTemplate());
    var $input = $html.find('input');
    var $domain = $html.find('.button.is-static').eq(1);

    if (name != '')
    {
        $input.val(name);
    }

    $domain.text(domain);

    if (addMethod === 'append')
    {
        $aliasContainer.append($html);
    }
    else
    {
        $aliasContainer.prepend($html);
    }
}


/**
 * Returns an array of objects with all alias addresses.
 * Each object has a 'name' and a id_domain' property.
 *
 * @returns  {Array}
 */
function getCurrentAliases()
{
    var aliases = new Array();

    $aliasContainer.find('.columns').each(function() {
        var $this = $(this);
        var name = $this.find('input').val().trim();

        if (name !== '')
        {
            aliases.push(name);
        }
    });

    return aliases;
}