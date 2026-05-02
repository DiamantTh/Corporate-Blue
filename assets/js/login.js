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


//======================================================================================================================
// Caps Lock detection (Login)
//======================================================================================================================

// Loginseite hat #password-annotations nur mit der Caps-Lock-Warnung. main.js
// laeuft hier nicht, daher eigene leichte Detection: Container + Warn-Absatz
// werden nur dann eingeblendet, wenn das Passwort-Feld fokussiert ist UND
// CapsLock per Modifier-State aktiv ist.
(function() {
    var $field = $('input[type="password"]');
    var $container = $('#password-annotations');
    var $caps = $('.app-password-annotation-caps-lock');
    if ($field.length === 0 || $container.length === 0 || $caps.length === 0) {
        return;
    }

    function update(event) {
        var native = event && event.originalEvent;
        var capsOn = native && typeof native.getModifierState === 'function'
            && native.getModifierState('CapsLock');
        if (capsOn && $field.is(':focus')) {
            $caps.show();
            $container.show();
        } else {
            $caps.hide();
            $container.hide();
        }
    }

    $field.on('keydown keyup focus', update);
    $field.on('blur', function() {
        $caps.hide();
        $container.hide();
    });
})();