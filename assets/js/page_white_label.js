$('.app-reset-selection').on('click', function() {
    let $this = $(this);
    let $modal = $('#app-modal-reset-single');
    let $id = $modal.closest('form').find('input[name="id"]');
    let language = $this.data('reset-language');

    $id.val(language);
    $modal.addClass('is-active');
});