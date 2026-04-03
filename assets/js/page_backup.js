//======================================================================================================================
// Open messages modal
//======================================================================================================================

    $('.app-modal-messages-trigger').click(function() {
        var $this = $(this);
        var $modal = $('#app-modal-messages');
        var content = $this.closest('tr').find('.app-messages-content').html();

        $modal.find('.app-messages-content').html(content);
        $modal.addClass('is-active');
    });
