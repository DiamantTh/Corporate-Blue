//======================================================================================================================
// Requirements
//======================================================================================================================

if (!cookieEnabled())
{
    $('#app-cookies-disabled').show();
}


//======================================================================================================================
// Login mode
//======================================================================================================================

$('.app-show-login-webauthn').click(function() {
    $('.app-show-with-login-password').hide();
    $('.app-show-with-login-webauthn').show();

    setCookie('login_use_webauthn', 1);
});

$('.app-show-login-password').click(function() {
    $('.app-show-with-login-password').show();
    $('.app-show-with-login-webauthn').hide();

    deleteCookie('login_use_webauthn');
});

if (getCookie('login_use_webauthn') === '1')
{
    $('.app-show-login-webauthn').trigger('click');
}


//======================================================================================================================
// WebAuthn
//======================================================================================================================

$('#app-webauthn-login').click(function() {
    checkWebAuthnLogin();
    $(this).addClass('is-loading');
});

// Pressing [Enter] will submit the form, we need to prevent this.
$('#form-login-webauthn').on('keypress', function(e)
{
    if (e.keyCode === 13)
    {
        e.preventDefault();
        $('#app-webauthn-login').trigger('click');
    }
});

//======================================================================================================================
// Demo
//======================================================================================================================

$('.app-demo-login-link').click(function() {
    let form = $('#form-login');
    let area = $(this).data('area');
    form.find('input[name="username"]').val(area);
    form.find('input[name="password"]').val(area);
    form.find('button').trigger('click');
});