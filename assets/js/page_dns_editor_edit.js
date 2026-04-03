//======================================================================================================================
// Enable / disable DNS
//======================================================================================================================

    var $showWithDnsEnabled = $('.app-show-with-dns-enabled');
    var $showWithDnsDisabled = $('.app-show-with-dns-disabled');

    $('input[name="is_disabled"]').on('change', function() {
        var $this = $(this);

        if ($this.prop('checked'))
        {
            $showWithDnsEnabled.hide(0);
            $showWithDnsDisabled.show(0);
        }
        else
        {
            $showWithDnsEnabled.show(0);
            $showWithDnsDisabled.hide(0);
        }
    }).trigger('change');

//======================================================================================================================
// Add / Remove records
//======================================================================================================================

    var recordTemplate = Handlebars.compile($('#app-record-template').html());
    var $recordContainer = $('#app-record-container');
    var $addRecord = $('.app-add-record');
    var $applyTtlToAll = $('#app-apply-ttl-to-all');
    var $form = $('#app-edit-dns-form');

    // On pageload, add records.
    for (var i = 0; i < records.length; i++)
    {
        addRecord(records[i].host, records[i].ttl, records[i].type, records[i].value);
    }

    // On button clicked, add record.
    $addRecord.on('click', function() {
        addRecord();

        // Set focus to first input field.
        $recordContainer.find('.app-record-row').last().find('input').first().focus();
    });

    // On button clicked, remove record.
    $recordContainer.on('click', '.app-remove-record', function() {
        $(this).closest('tr').remove();
    });

//======================================================================================================================
// Misc
//======================================================================================================================

    // Apply TTL value to all.
    $applyTtlToAll.on('click', function() {
        $recordContainer.find('input[name="ttl"]').val(getTimeToLife());
    });

    // Submit.
    $form.submit(function() {
        $('input[name=records]').val(JSON.stringify(getCurrentRecords()));
        return true;
    });

//======================================================================================================================
// Functions
//======================================================================================================================

/**
 * Adds a new record row to the defined location inside of container.
 *
 * @param    string  host
 * @param    string  ttl
 * @param    string  type
 * @param    string  value
 * @returns  bool
 */
function addRecord(host, ttl, type, value)
{
    var isDkim = (host === '<DKIM_RECORD_HOST>') || (value === '<DKIM_RECORD_VALUE>');

    var $html = $(recordTemplate({
        host: host,
        ttl: ttl,
        type: type,
        value: value,
        is_dkim: isDkim,
    }));

    if (typeof(host) !== 'undefined')
    {
        $html.find('input[name="host"]').val(host);
    }

    if (typeof(ttl) === 'undefined' || ttl === '')
    {
        $html.find('input[name="ttl"]').val(getTimeToLife());
    }
    else
    {
        $html.find('input[name="ttl"]').val(ttl);
    }

    if (typeof(type) !== 'undefined')
    {
        $html.find('select').val(type);
    }

    if (typeof(value) !== 'undefined')
    {
        $html.find('input[name="value"]').val(value);
    }

    // Bind open-modal event to dynamic element.
    if (isDkim)
    {
        $html.find('[data-open-modal]').on('click', function() {
            var $this = $(this);
            var selector = '#' + $this.data('open-modal');
            $(selector).addClass('is-active');
        });
    }

    $recordContainer.find('#app-add-records-before').before($html);

    return true;
}

/**
 * Gets the current soa ttl value.
 *
 * @returns  {int}
 */
function getTimeToLife()
{
    return $('input[name="soa_ttl"]').val();
}

/**
 * Returns an array of objects with all records.
 * Each object has a 'host', 'ttl', 'type', 'value' property.
 *
 * @returns  {Array}
 */
function getCurrentRecords()
{
    var records = new Array();
    var i = 0;

    $recordContainer.find('.app-record-row').each(function() {
        var $this = $(this);

        var host  = $this.find('input[name="host"]').val().trim();
        var ttl   = $this.find('input[name="ttl"]').val().trim();
        var type  = $this.find('select[name="type"]').val();
        var value = $this.find('input[name="value"]').val().trim();

        records[i] = {
            host: host,
            ttl: ttl,
            type: type,
            value: value
        };
        i++;
    });

    return records;
}
