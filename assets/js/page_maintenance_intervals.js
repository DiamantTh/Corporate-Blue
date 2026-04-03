// Read the settings from the task row, and assign them to the modal.
$('.app-edit-task').on('click', function() {
    const $this = $(this);
    const $modal = $('#app-modal-edit-task');
    const $form = $modal.closest('form');
    const $tr = $this.closest('tr');

    // Update inputs.
    const selectors = [
        'id',
        'name',
        'is_enabled',
        'interval',
        'interval_unit',
        'timeframe_start',
        'timeframe_end'
    ];

    for (var i = 0; i < selectors.length; i++)
    {
        let selector = 'input[name="' + selectors[i] + '"], select[name="' + selectors[i] + '"]';
        let value = $tr.find(selector).val();

        if (selectors[i] === 'name')
        {
            $modal.find('#app-task-name p').html(value);
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

    // Disable/Enable minutes in interval dropdown.
    let disabledValue = Boolean($tr.find('input[name="interval_disable_minutes"]').val());
    $modal.find('select[name="interval_unit"]').find('option[value="minute"]').prop('disabled', disabledValue);

    $modal.addClass('is-active');
});
