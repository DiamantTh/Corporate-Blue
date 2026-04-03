// Scope
$('select[name="scope"]').change(function() {
    let $this = $(this);
    let $div = $('.app-show-with-users-list');

    $this.val() === 'select' ? $div.show(200) : $div.hide();
}).trigger('change');

// Buttons
$('.app-select-all').click(function() {
    $('#app-user-list').find('input[type="checkbox"][name$="[]"]').prop("checked", true);
});

$('.app-deselect-all').click(function() {
    $('#app-user-list').find('input[type="checkbox"][name$="[]"]').prop("checked", false);
});