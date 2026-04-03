$('#form-domains').on('click', '.app-open-dkim-modal', function() {
    var $this = $(this);
    var $modal = $('#app-modal-dkim');
    var $tr = $this.closest('table').closest('tr');

    // Update inputs.
    var selectors = ['dkim_record', 'dkim_host', 'dkim_record_value_quotes', 'dkim_record_value_no_quotes'];

    for (var i = 0; i < selectors.length; i++)
    {
        var selector = 'input[name="' + selectors[i] + '"]';
        var value = $tr.find(selector).val();

        $modal.find(selector).val(value);
    }

    $modal.addClass('is-active');
})