/**
 * Creates a new WebAuthn device.
 *
 * @returns {undefined}
 */
async function createWebAuthnRegistration()
{
    try
    {
        // Check browser support
        if (!window.fetch || !navigator.credentials || !navigator.credentials.create)
        {
            throw new Error('Your browser does not support WebAuthn.');
        }

        // Get create args
        let response = await window.fetch('ajax.php', {
            method: 'POST',
            cache: 'no-cache',
            headers: { 'Content-Type' : 'application/x-www-form-urlencoded' },
            body: 'action=webauthn_get_create_args' + '&_csrf_token=' + hash['csrf_token']
        });

        // Error handling (http error)
        if (response.status !== 200)
        {
            throw new Error('Failed to start registration process.');
        }

        const createArgs = await response.json();

        // Error handling (WebAuthn)
        if (createArgs.success === false)
        {
            throw new Error(createArgs.error_msg || 'An unknown error occured.');
        }

        // Replace binary base64 data with ArrayBuffer.
        recursiveBase64StrToArrayBuffer(createArgs);

        // Create credentials
        const credentials = await navigator.credentials.create(createArgs);

        // Create object for transmission to server
        const authenticatorAttestationResponse = {
            transports: credentials.response.getTransports ? credentials.response.getTransports() : null,
            clientDataJSON: credentials.response.clientDataJSON ? arrayBufferToBase64(credentials.response.clientDataJSON) : null,
            attestationObject: credentials.response.attestationObject ? arrayBufferToBase64(credentials.response.attestationObject) : null
        };

        // Check auth on server side
        response = await window.fetch('ajax.php', {
            method: 'POST',
            cache: 'no-cache',
            headers: { 'Content-Type' : 'application/x-www-form-urlencoded' },
            body: 'action=webauthn_process_create&data=' + encodeURIComponent(JSON.stringify(authenticatorAttestationResponse)) + '&_csrf_token=' + hash['csrf_token']
        });

        // Error handling
        if (response.status !== 200)
        {
            throw new Error('Failed to validate registration.');
        }

        const serverResponse = await response.json();

        // Error handling
        if (serverResponse.error === true)
        {
            throw new Error(serverResponse.error_msg);
        }

        // Success, perform a reload
        window.location.hash = '#tab-web-auth';
        window.location.reload();
    }
    catch (err)
    {
        console.log(err.message || 'An unknown error occured.');

        $('#app-add-authenticator').removeClass('is-loading');
        $('#app-webauthn-error').show(200);
        $('#app-webauthn-error-message').text(err.message || 'An unknown error occured.');
    }
}

/**
* Checks a FIDO2 registration
*
* @returns {undefined}
*/
async function checkWebAuthnLogin()
{
   try
   {
        // Check browser support
        if (!window.fetch || !navigator.credentials || !navigator.credentials.create)
        {
            throw ({
                success:      false,
                error_msg:    'Browser not supported.',
                redirect_url: 'index.php'
            });
        }

        // Get get args
        let response = await window.fetch('index.php', {
            method: 'POST',
            cache: 'no-cache',
            headers: { 'Content-Type' : 'application/x-www-form-urlencoded' },
            body: 'webauthn_action=get_args&webauthn_username=' + $('input[name="webauthn_username"]').val()
        });

        // Error handling (http error)
        if (response.status !== 200)
        {
            throw ({
                success:      false,
                error_msg:    'Failed to start login process.',
                redirect_url: 'index.php'
            });
        }

        const getArgs = await response.json();

        // Error handling (WebAuthn)
        if (getArgs.success === false)
        {
            throw ({
                success:      false,
                error_msg:    getArgs.error_msg,
                redirect_url: getArgs.redirect_url
            });
        }

        // Replace binary base64 data with ArrayBuffer.
        recursiveBase64StrToArrayBuffer(getArgs);

        // Check credentials with hardware
        const credentials = await navigator.credentials.get(getArgs);

        // Create object for transmission to server
        const authenticatorAttestationResponse = {
            id: credentials.rawId ? arrayBufferToBase64(credentials.rawId) : null,
            clientDataJSON: credentials.response.clientDataJSON  ? arrayBufferToBase64(credentials.response.clientDataJSON) : null,
            authenticatorData: credentials.response.authenticatorData ? arrayBufferToBase64(credentials.response.authenticatorData) : null,
            signature: credentials.response.signature ? arrayBufferToBase64(credentials.response.signature) : null,
            userHandle: credentials.response.userHandle ? arrayBufferToBase64(credentials.response.userHandle) : null
        };

        // Send to server
        response = await window.fetch('index.php', {
            method: 'POST',
            cache: 'no-cache',
            headers: { 'Content-Type' : 'application/x-www-form-urlencoded' },
            body: 'webauthn_action=process_get&webauthn_data=' + encodeURIComponent(JSON.stringify(authenticatorAttestationResponse))
        });

        // Error handling
        if (response.status !== 200)
        {
            throw ({
                success:      false,
                error_msg:    'Failed to validate login.',
                redirect_url: 'index.php'
            });
        }

        const serverResponse = await response.json();

        // Error handling
        if (serverResponse.error === true)
        {
            throw ({
                success:      false,
                error_msg:    serverResponse.error_msg,
                redirect_url: 'index.php'
            });
        }

        // Login successful
        location.href = serverResponse.success === true ? serverResponse.redirect_url : 'index.php';
   }
   catch (object)
   {
       if (object.error_msg)
       {
           window.alert(object.error_msg);
       }

       location.href = object.redirect_url ? object.redirect_url : 'index.php';
   }
}


/**
 * Convert RFC 1342-like base64 strings to array buffer.
 *
 * @param    {mixed}  obj
 * @returns  {void}
 */
function recursiveBase64StrToArrayBuffer(obj)
{
    let prefix = '=?BINARY?B?';
    let suffix = '?=';

    if (typeof obj !== 'object')
    {
        return;
    }

    for (let key in obj)
    {
        if (typeof obj[key] === 'string')
        {
            let str = obj[key];
            if (str.substring(0, prefix.length) === prefix && str.substring(str.length - suffix.length) === suffix)
            {
                str = str.substring(prefix.length, str.length - suffix.length);

                let binary_string = window.atob(str);
                let len = binary_string.length;
                let bytes = new Uint8Array(len);
                for (let i = 0; i < len; i++)
                {
                    bytes[i] = binary_string.charCodeAt(i);
                }
                obj[key] = bytes.buffer;
            }
        }
        else
        {
            recursiveBase64StrToArrayBuffer(obj[key]);
        }
    }
}

/**
 * Convert a ArrayBuffer to base64
 *
 * @param    {ArrayBuffer}  buffer
 * @returns  {String}
 */
function arrayBufferToBase64(buffer) {
    let binary = '';
    let bytes = new Uint8Array(buffer);
    let len = bytes.byteLength;

    for (let i = 0; i < len; i++)
    {
        binary += String.fromCharCode( bytes[ i ] );
    }
    return window.btoa(binary);
}