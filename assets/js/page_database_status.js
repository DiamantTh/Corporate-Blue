// Read the settings from the items table row and assign them to the modal.
$('.app-kill-process').on('click', function() {
    var $this = $(this);
    var $modal = $('#app-modal-kill-process-id');
    var $form = $modal.closest('form');
    var $tr = $this.closest('tr');

    // Update ID.
    $form.find('input[name="process_id"]').val($tr.find('input[name="process_id"]').val());

    // Update values in modal table.
    $form.find('.app-kill-process-id').html($tr.find('input[name="process_id"]').val());
    $form.find('.app-kill-username').html($tr.find('input[name="username"]').val());
    $form.find('.app-kill-host').html($tr.find('input[name="host"]').val());
    $form.find('.app-kill-database').html($tr.find('input[name="database"]').val());

    $modal.addClass('is-active');
});
