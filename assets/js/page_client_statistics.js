var $button = $('#app-open-domain-statistics');
var href = $button.attr('href');

$button.on('click', function (event) {
    var domain = $('select[name="domain"]').val().trim();

    if (!domain)
    {
        event.preventDefault();
        return
    }

    var url = href + '/' + domain;
    $button.attr('href', url);
});
