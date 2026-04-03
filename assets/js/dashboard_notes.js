//
// Used for the update notes feature on admin and client dashboards.
//

let $notes = $('#app-notes');
let $textarea = $('#app-notes-textarea');
let $edit =  $('#app-edit-notes');
let $save =  $('#app-save-notes');
let $card = $notes.closest('.card');

// Edit
$edit.click(function() {
    $edit.hide();
    $save.show(200);
    $notes.hide();

    $textarea.val($notes.text());
    $textarea.removeClass('is-hidden');
    $textarea.trigger('input'); // trigger auto-resize (After show()!)
    $textarea.focus();
});

// Save
$textarea.on('blur', function() {
    let string = $textarea.val();
    let stringSanitized = string.replace(/(?:\r\n|\r|\n)/g, "\n").trim();

    $edit.show(200);
    $save.hide();
    $textarea.addClass('is-hidden');
    $notes.text(stringSanitized);
    $notes.show(200);

    ajax({
        action: 'update_dashboard_notes',
        data: {
            server_notes: stringSanitized
        },
        beforeSend: function()
        {
            $card.addClass('is-loading');
        },
        complete: function()
        {
            $card.removeClass('is-loading');
        }
    });
});