$('#app-iframe').on('load', function() {
    if (rspamd_access !== '') {
        // We need to delay the call to this function, as rspamd WebUI might not be ready yet.
        setTimeout(() => retryUntil(tryPassword, 100, 30), 1000);
    }

    retryUntil(updateThemeMode, 100, 30);
});


function retryUntil(fn, interval, maxAttempts, attempt = 0)
{
    const success = fn(attempt);
    if (!success && attempt < maxAttempts)
    {
        setTimeout(() => retryUntil(fn, interval, maxAttempts, attempt + 1), interval);
    }
}

function tryPassword(attempts = 0)
{
    console.log('Rspamd auto-login try #' + (attempts + 1));
    const $contents = $('#app-iframe').contents();
    const $passwordInput = $contents.find('#connectPassword');
    const $submitButton = $contents.find('#connectButton');
    const $connectDialog = $contents.find('#connectDialog');
    const $modalBackdrop = $contents.find('.modal-backdrop');

    if ($passwordInput.length === 0 || $submitButton.length === 0 || $connectDialog.hasClass('show') === false)
    {
        return false;
    }

    $passwordInput.val(rspamd_access);
    $submitButton.trigger('click');

    // Hide the access code from source code.
    $('#app-rspamd-web-ui-password').remove();
    rspamd_access = '';

    return true;
}

function updateThemeMode(attempts = 0)
{
    console.log('Rspamd update theme mode try #' + (attempts + 1));

    const $contents = $('#app-iframe').contents();
    const $html = $contents.find('html');
    const $body = $contents.find('body');
    const theme = hash['theme.is_dark_mode'] ? 'dark' : 'light';

    if ($html.length === 0 || $body.length === 0)
    {
        return false;
    }

    $html.attr('data-bs-theme', theme);
    $body.attr('data-theme', theme);
    return true;
}