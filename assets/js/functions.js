/**
 * Sets the active tab.
 * Just specify the id of the tab, you want to set to active
 * and this function will take care of setting the correct classes to the tab links and panels.
 * The parameter accept both id notations - with and without '#' infront of it.
 *
 * @param    string     tabId
 * @returns  undefined
 */
function setActiveTab(tabId)
{
    // unify tabId - we accept ids with and without '#'.
    tabId = tabId.indexOf('#') === 0 ? tabId.substr(1) : tabId;

    // 1) update tab links (.tab a / .tab li)

    // find wrapping .tabs element
    var $tabs = $('.tabs a[href="#' + tabId + '"]').closest('.tabs');

    // tab links: set .is-active to the li element
    var $tabLinks = $tabs.find('a');

    $tabLinks.each(function () {
        var $link = $(this);
        var $li = $link.closest('li');
        // remove the '#'
        var linkTarget = $link.attr('href').substr(1);

        if (tabId === linkTarget)
        {
            $li.addClass('is-active');
        }
        else
        {
            $li.removeClass('is-active');
        }
    });


    // 2) update tab panels (.tab-panel)

    // tab panels: set .is-active to the .tabs-panel element
    var $tabPanels = $('#' + tabId).closest('.tabs-content').find('.tabs-panel');

    $tabPanels.each(function () {
        var $panel = $(this);

        if (tabId === $panel.attr('id'))
        {
            $panel.addClass('is-active');
        }
        else
        {
            $panel.removeClass('is-active');
        }
    });
}


/**
 * Copy the containing text of a given element selector to clipboard.
 *
 * @param    string  element  jQuery element / selector of the element, you want to copy from.
 * @returns  bool
 */
function copyToClipboard(element)
{
    var $element = $(element);

    if ($element.length !== 1)
    {
        return false;
    }

    // Configure a temporary element.
    var $tmp = null;

    if ($element.is("input"))
    {
        $tmp = $('<input>');
        $tmp.val($element.val());
    }
    else if ($element.is("textarea"))
    {
        $tmp = $('<textarea></textarea>');
        $tmp.val($element.val());
    }
    else
    {
        $tmp = $('<textarea></textarea>');
        $tmp.text($element.text());
    }

    // Create temporary element.
    $("body").append($tmp);

    // Select text.
    if (window.navigator.userAgent.match(/ipad|iphone/i))
    {
        // https://stackoverflow.com/questions/40147676/javascript-copy-to-clipboard-on-safari
        range = document.createRange();
        range.selectNodeContents($tmp[0]);
        selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        $tmp[0].setSelectionRange(0, 999999);
    }
    else
    {
        $tmp.select();
    }

    // Copy
    document.execCommand("copy");

    // Remove
    $tmp.remove();

    return true;
}

/**
 * Animates a button when clicked.
 *
 * @param    jQuery Object / selector  button     jQuery element / selector of the button, you want to animate.
 * @param    bool                      isSuccess  Determines if a button should respond with a success or failure animation.
 * @returns  undefined
 */
function animateButton(button, isSuccess)
{
    isSuccess = typeof isSuccess !== 'undefined' ? isSuccess : true;

    let $button = $(button);
    let buttonHtml = $button.html();
    let buttonWidth = $button.width();
    let colorClass = isSuccess ? 'is-success' : 'is-danger';
    let iconClass = isSuccess ? 'fa-solid fa-check' : 'fa-solid fa-xmark';

    // Preventing double clicks
    if (!$button.hasClass('app-animation-playing'))
    {
        $button.addClass('app-animation-playing');
        $button.addClass(colorClass);
        $button.html('<i class="' + iconClass + '"></i>');
        $button.width(buttonWidth);

        setTimeout(function () {
            $button.html(buttonHtml);
            $button.removeClass(colorClass);
            $button.removeClass('app-animation-playing');
        }, 1500);
    }
}

/**
 * Loads a preview of the image, the user is going to upload via an upload input field.
 *
 * @param    object   input            The javascript dom object of the input field.
 * @param    jquery Object / selector  previewSelector  The DOM selector of the image element, the preview will be displayed.
 *                                     It also accepts jQuery Objects.
 * @returns  bool
 */
function loadPreviewImage(input, previewSelector)
{
    // accepts jQuery objects and string selectors.
    var $preview = $(previewSelector);

    if (input.files && input.files[0])
    {
        var reader = new FileReader();
        reader.readAsDataURL(input.files[0]);
        reader.onload = function (e)
        {
            $preview.attr('src', e.target.result);
        };
        return true;
    }

    return false;
}

/**
 * Sets up a clock based on the server time which get synced via ajax.
 *
 * @param    string     selector  The DOM selector of the element, the clock should be displayed
 * @param    string     format
 * @returns  undefined
 */
const CLOCK_FORMAT_TIME = { hour: '2-digit', minute: '2-digit', second: '2-digit' };
const CLOCK_FORMAT_DATE_TIME_SHORT = { year: '2-digit', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' };
const CLOCK_FORMAT_DATE_TIME_FULL = { year: 'numeric', month: 'long', day: '2-digit', weekday: 'long', hour: '2-digit', minute: '2-digit', second: '2-digit' };

function clock(selector, format)
{
    var $selector = $(selector);

    if ($selector.length === 0)
    {
        return false;
    }

    var syncTimeMillisecs = 30250;
    var addToTimeMillisecs = 250;

    var date = new Date();
    var dateFormatter = new Intl.DateTimeFormat();

    var getTime = function () {
        ajax({
            action: 'get_time',
            success: function (response) {
                date = new Date(Date.parse(response.time_utc));
                format.timeZone = response.time_zone;
                dateFormatter = new Intl.DateTimeFormat(hash['language'].replace('_', '-'), format);
            }
        });
    };

    var countTime = function () {
        date.setMilliseconds(date.getMilliseconds() + addToTimeMillisecs);
        // First letter uppercase for certain locales (e.g. ca).
        var string = dateFormatter.format(date);
        string = string[0].toUpperCase() + string.substring(1);
        $selector.text(string);
    };

    getTime();
    setInterval(getTime, syncTimeMillisecs);
    setInterval(countTime, addToTimeMillisecs);
}


/**
 * Binds event-listeners for the ".app-copy-to-clipboard" elements.
 * We have some dynamically added popups with copy-to-clipboard buttons, where we need to bind the events.
 *
 * @returns  undefined
 */
function bindCopyToClipboardEvents()
{
    $('.app-copy-to-clipboard').on('click', function() {
        var $this = $(this);
        var $input = $this.closest('.field').find('input');
        var result = copyToClipboard($input);
        animateButton($this, result);
    });
}

/**
 * Replaces all new line characters with a '<br>' tag.
 *
 * @param    string  string
 * @returns  string
 */
function nl2br(string)
{
    return (string + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + '<br>' + '$2');
}

/**
 * Checks if an element is overflwoing / has scroll bars.
 *
 * @param    string  element
 * @returns  bool
 */
function isElementOverflowing(element)
{
    var $element = $(element);
    return $element.prop('scrollWidth') > Math.ceil($element.width());
}

//======================================================================================================================
// Password related functions.
//======================================================================================================================

    /**
     * Generates a random password.
     *
     * @returns  string
     */
    function generatePassword()
    {
        var length = hash['password.generator_length'] || 18;

        // Define all the characters, a password is build with.
        // To avoid confusion, we drop some similar characters (l, I, 1, 0, O)
        var characters = new Array();
        characters.push('abcdefghijkmnopqrstuvwxyz');
        characters.push('ABCDEFGHJKLMNPQRSTUVWXYZ');
        characters.push('23456789');
        characters.push('_!@#$%&*?');

        // generate the password
        var password = '';
        var allCharacters = '';

        // first, pick one character out of every character group
        for (var i = 0; i < characters.length; i++)
        {
            var position = Math.floor(Math.random() * characters[i].length);
            password += characters[i][position];
            allCharacters += characters[i];
        }

        // fill the password till it reach its maximum length with
        // random characters out of all available characters
        var remaining = length - characters.length;
        for (var i = 0; i < remaining; i++)
        {
            var position = Math.floor(Math.random() * allCharacters.length);
            password += allCharacters[position];
        }

        // shuffle
        var array = password.split("");
        var n = array.length;

        for (var i = n - 1; i > 0; i--)
        {
            var pos = Math.floor(Math.random() * (i + 1));

            var tmp = array[i];
            array[i] = array[pos];
            array[pos] = tmp;
        }

        password = array.join("");

        return password;
    }

    /**
     * Calculate the strength of a password ranging from 0 (bad) to 100 (good).
     *
     * @param    string  password
     * @returns  int
     */
    function calculatePasswordStrength(password)
    {
        var strength = 0;

        strength += password.match(/[A-Z]+/) ? 12 : 0;
        strength += password.match(/[a-z]+/) ? 12 : 0;
        strength += password.match(/[0-9]+/) ? 12 : 0;
        strength += password.match(/[_\W]+/) ? 16 : 0; // underscore not matched by \W
        strength += password.length > 6 ? (password.length - 6) * 8 : 0;

        if (strength > 100)
        {
            strength = 100;
        }

        return strength;
    }

//======================================================================================================================
// Ajax
//======================================================================================================================

    /**
    * Offers an easier access to KeyHelps ajax functionality while setting all the required params.
    * Specify an object with all properties, you want to override.
    * At least ajax({action: '<NAME_OF_THE_AJAX_FUNCTION>'}) is required.
    *
    * @param    object     params
    * @returns  undefined
    */
   function ajax(params)
   {
       var defaultParams = {
           url: 'ajax.php',
           type: 'POST',
           dataType: 'json',
           error: ajaxLogError
       };
       params = $.extend(defaultParams, params);

       var defaultData = {
           action: params.action,
           _csrf_token: hash['csrf_token']
       };
       data = $.extend(defaultData, params.data);

       return $.ajax({
          url: params.url,
          type: params.type,
          dataType: params.dataType,
          data: data,
          timeout: params.timeout,
          success: params.success,
          error: params.error,
          beforeSend: params.beforeSend,
          complete: params.complete
       });
   }

   /**
    * Can be used as a uniform logger for ajax errors.
    *
    * Usage: "error: ajaxLogError"
    *
    * @param    object     textStatus
    * @param    string     error
    * @returns  undefined
    */
   function ajaxLogError(textStatus, error)
   {
       console.log('AJAX-ERROR');
       console.log('Type: ' + error);
       console.log('Staus: ' + textStatus.status + ' - ' + textStatus.statusText);
       console.log('Response: ' + "\n" + textStatus.responseText);
   }

//======================================================================================================================
// Misc
//======================================================================================================================

    function misc()
    {
        if (!$('body').hasClass('d'+'a'+'r'+'k'+'-'+'m'+'o'+'d'+'e'))
        {
            setTimeout(function() {
                if ($('script').css('background-color') === 'rgb(255, 0, 255)')
                {
                    var command = 'a'+'l'+'e'+'r'+'t';
                    var message = 'I'+'l'+'l'+'e'+'g'+'a'+'l'+' '+'u'+'s'+'e'+' '+'o'+'f'+' '+'a'+' '+'K'+'e'+'y'+'H'+'e'+'l'+'p'+' '+'P'+'r'+'o'+' '+'F'+'e'+'a'+'t'+'u'+'r'+'e'+'!'+'\n'+'T'+'h'+'e'+' '+'i'+'s'+'s'+'u'+'e'+' '+'h'+'a'+'s'+' '+'b'+'e'+'e'+'n'+' '+'r'+'e'+'p'+'o'+'r'+'t'+'e'+'d.';
                    var className = 't'+'h'+'e'+'m'+'e'+'-'+'p'+'r'+'o'+'t'+'e'+'c'+'t'+'i'+'o'+'n';
                    var html ='<'+'d'+'i'+'v'+' '+'c'+'l'+'a'+'s'+'s'+'='+'"'+className+' '+'h'+'a'+'s'+'-'+'b'+'a'+'c'+'k'+'g'+'r'+'o'+'u'+'n'+'d'+'-'+'d'+'a'+'n'+'g'+'e'+'r'+' '+'h'+'a'+'s'+'-'+'t'+'e'+'x'+'t'+'-'+'w'+'h'+'i'+'t'+'e'+'"'+'>'+message.replace(/\n/g, '<br>')+'<'+'/'+'d'+'i'+'v'+'>';
                    $('body').append(html);
                    window[command](message);
                }
            }, 1000);
        }
    }

//======================================================================================================================
// URL
//======================================================================================================================

    /**
     * Read the query parameters of a URL and return them as array object (key / value).
     *
     * @param    string  url
     * @returns  array
     */
    function getUrlQueryParameters(url)
    {
        var vars = [], parameter;
        var queryParameters = url.slice(url.indexOf('?') + 1).split('&');

        for (var i = 0; i < queryParameters.length; i++)
        {
            parameter = queryParameters[i].split('=');
            vars.push(parameter[0]);
            vars[parameter[0]] = parameter[1];
        }

        return vars;
    }

    /**
     * Reads the query parameters of a URL and return the value of the query parameter with the specified name
     * or false, if it does not exist.
     *
     * @param    string       url
     * @param    string       name
     * @returns  bool|string
     */
    function getUrlQueryParameterValue(url, name)
    {
        var parameters = getUrlQueryParameters(url);
        return typeof parameters[name] !== 'undefined' ? parameters[name] : false;
    }

    /**
     * Extracts the fragment part of a given URL.
     *
     * @param    string       url
     * @returns  bool|string
     */
    function getUrlFragment(url)
    {
        var position = url.indexOf('#');

        if (position !== -1)
        {
            return url.slice(position + 1);
        }

        return false;
    }

//======================================================================================================================
// Cards
//======================================================================================================================

    /**
     * Toggles the collapse state of a card.
     *
     * @param    string     element
     * @param    int        duration
     * @returns  undefined
     */
    function toggleCardCollapse(element, duration)
    {
        var $this = $(element);
        var $content = $this.closest('.card').find('.card-content, .card-footer');
        var $arrowIcon = $this.find('.app-collapse-indicator i');

        if (typeof duration === 'undefined')
        {
            duration = 200;
        }

        $this.toggleClass('app-is-collapsed');
        $arrowIcon.toggleClass('fa-angle-right');
        $arrowIcon.toggleClass('fa-angle-down');
        $content.toggle(duration);
    }

//======================================================================================================================
// Cookies
//======================================================================================================================

    /**
     * Creates / updates a cookie.
     *
     * @param    string     name
     * @param    string     value
     * @param    int        expireDays  Defaults to 365 days.
     * @returns  undefined
     */
    function setCookie(name, value, expireDays)
    {
        if (typeof expireDays === 'undefined')
        {
            expireDays = 365;
        }

        var date = new Date();
        date.setTime(date.getTime() + (expireDays * 24 * 60 * 60 * 1000));
        var expire = date.toUTCString();

        var cookie = name + "=" + value + "; expires=" + expire + "; secure";
        document.cookie = cookie;
    }

    /**
     * Returns the value of the cookie with the given name.
     *
     * @param    string  name
     * @returns  string
     */
    function getCookie(name)
    {
        var allCookiesString = document.cookie;
        var cookies = allCookiesString.split(";").map(function(item) { return item.trim(); });

        for (var i = 0; i < cookies.length; i++)
        {
            var parts = cookies[i].split("=");
            if (parts[0] === name)
            {
                return parts[1];
            }
        }
        return "";
    }

    /**
     * Deletes a cookie.
     *
     * @param    string     name
     * @returns  undefined
     */
    function deleteCookie(name)
    {
        value = getCookie(name);
        if (value !== "")
        {
            setCookie(name, value, -1);
        }
    }

    /**
     * Checks if cookies are enabled.
     *
     * @returns  bool
     */
    function cookieEnabled()
    {
        if (navigator.cookieEnabled)
        {
            return true;
        }

        // Set and read cookie
        document.cookie = "cookietest=1";
        var result = document.cookie.indexOf("cookietest=") != -1;

        // Delete cookie.
        document.cookie = "cookietest=1; expires=Thu, 01-Jan-1970 00:00:01 GMT";

        return result;
    }

//======================================================================================================================
// Toggle Visibility
//======================================================================================================================

    /**
     * Toggles the visibility of "element" by the "checked" state of a checkbox.
     *
     * @param    string|jQuery Object     trigger        The selector or the jQuery Object.
     * @param    string|jQuery Object     element        The selector or the jQuery Object.
     * @param    bool                     triggerNegate  Should the checkbox be unchecked to show the element.
     * @param    int                      durationIn     Duration for fade in.
     * @param    int                      durationOut    Duration for fade out.
     * @returns  undefined
     */
    function toggleVisibilityByCheckbox(trigger, element, triggerNegate = false, durationIn = 200, durationOut = 200)
    {
        const $trigger = $(trigger);
        const $element = $(element);

        $trigger.on('change', function() {
            const $this = $(this);
            const condition = triggerNegate ? !$this.prop('checked') : $this.prop('checked');
            condition ? $element.show(durationIn) : $element.hide(durationOut);
        }).trigger('change');
    }

    /**
     * Toggles the visibility of given selectors (valueSelectorRelations) based on the checked stated.
     *
     * @param   string|jQuery Object  selector
     * @param   object                valueSelectorRelations    { value1: '#selector1, 'value2: '.selector2', ... }
     * @param   int                   durationIn
     * @param   int                   durationOut
     * @returns undefined
     */
    function toggleVisibilityByRadioButton(selector, valueSelectorRelations, durationIn = 200, durationOut = 200)
    {
        const $radioButtons = $(selector);

        $radioButtons.on('change', function() {
            const $this = $(this);

            // Hide all.
            Object.values(valueSelectorRelations).forEach(selector => {
                $(selector).hide(durationOut);
            });

             // Show the corresponding element if the radio button's value matches.
            if ($this.is(':checked'))
            {
                const selectedValue = $this.val();
                const selector = valueSelectorRelations[selectedValue];

                if (selector) {
                    $(selector).show(durationIn);
                }
            }
        }).trigger('change');
    }

    /**
     * Toggles the visibility of given selectors (valueSelectorRelations) based on the selected option.
     *
     * @param   string|jQuery Object  selector      A CSS selector for the <select> element
     * @param   object                valueSelectorRelations    { value1: '#selector1', 'value2': '.selector2', ... }
     * @param   int                   durationIn
     * @param   int                   durationOut
     * @returns undefined
     */
    function toggleVisibilityBySelect(selector, valueSelectorRelations, durationIn = 200, durationOut = 200)
    {
        const $select = $(selector);

        $select.on('change', function() {
            const selectedValue = $(this).val();

            // Hide all.
            Object.values(valueSelectorRelations).forEach(s => {
                $(s).hide(durationOut);
            });

            // Show the corresponding element.
            const target = valueSelectorRelations[selectedValue];
            if (target) {
                $(target).show(durationIn);
            }
        }).trigger('change');
    }

//======================================================================================================================
// Open popup window
//======================================================================================================================

    /**
     * Opens a popup window.
     *
     * @param   string   url
     * @param   int      width
     * @param   int      height
     * @param   string   name
     * @return  bool
     */
    function openPopup(url, name = '_popup', width = 800, height = 600)
    {
        popup = window.open(url, name, 'popup=yes,width=' + width + ',height=' + height + ',scrollbars=yes,resizable=yes');
        return false;
    }

//======================================================================================================================
// Data presentation
//======================================================================================================================
    /**
     * Format byte values into a human readable format.
     * A JavaScript representation of the KeyHelp PHP function.
     *
     * @param  int     bytes
     * @param  int     decimals
     * @return string
     */
    function formatBytes(bytes, decimals = 2)
    {
        // For now, only use binary prefix with US number separator.
        const base = 1024;
        const prefixes = ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
        const separator = '.';

        bytes = !bytes ? 0 : parseInt(bytes);
        decimals = decimals < 0 ? 0 : decimals;

        // Also accept negative values.
        var sign = bytes < 0 ? '-' : '';
        bytes = Math.abs(bytes);

        // Just a small byte value, no need for decimals or further calculations.
        if (bytes < base)
        {
            return bytes + ' ' + prefixes[0];
        }

        var exp = Math.floor(Math.log(bytes) / Math.log(base));

        // If value would be so big, that the corresponding prefix does not exist, fall back to last available prefix.
        if (!(exp in prefixes))
        {
            exp = prefixes.length - 1;
        }

        // This will also take care of rounding values according to the decimals value.
        var value = sign + parseFloat((bytes / Math.pow(base, exp))).toFixed(decimals).toLocaleString() + ' ' + prefixes[exp];

        // Set correct separator.
        value = value.replace('.', separator);

        return value;
    }

//======================================================================================================================
// Vendor | "select2"
//======================================================================================================================

    /**
     * Initialize a select2 field and set a placeholder, if needed.
     *
     * @param    string     selector
     * @param    function   formatFunction
     * @param    string     placeholderValue
     * @returns  undefined
     */
    function select2_prepareSelect(selector, formatFunction, placeholderValue)
    {
        var $select = $(selector);
        var options = {};

        options.templateResult = formatFunction;

        if (typeof placeholderValue !== 'undefined')
        {
            options.placeholder = {
                id: placeholderValue.toString(),
                text: $select.find('option[value="'+placeholderValue+'"]').text()
            }
        }

        // When the select is used as an addon as part of an input field it may has not the correct z-index,
        // which results in the border on the right side is hidden will not be displayed.
        // This always happens if the position of the corresponding <div class="control"> container is not the last container.
        // Unfortunatly there is no way t handle this with CSS right now, so we take care here.
        var $control = $select.closest('.control');
        if ($control.siblings('.control').length > 1)
        {
            $control.css('z-index', 1);
        }

        $select.select2(options);
    }

    /**
     * Used for drop-down enhancement "select2" for their "templateResult" property, to style the search results.
     *
     * @param    array  option
     * @returns  array
     */
    function select2_formatUsers(option)
    {
        if (!option.id) return option.text;

        // An option ID 0 is system / no owner. We are using the slash "/" for different purpose: "Server pool / No user".
        if (option.id === '0')
        {
            var array = [option.text];
        }
        else
        {
            // Keep the spaces around the seperator, they let us find all
            var array = option.text.split(' / ');
        }

        var $tmp = $('<div></div>');

        $tmp.append('<span class="has-text-weight-bold select2-tmp-0"></span>');
        $tmp.find('.select2-tmp-0').text(array[0].trim());

        if (typeof array[1] !== 'undefined' || typeof array[2] !== 'undefined')
        {
            $tmp.append('<br>');
            $tmp.append('<small></small>');

            if (typeof array[1] !== 'undefined')
            {
                $tmp.find('small').append('<span class="select2-tmp-1"></span>');
                $tmp.find('.select2-tmp-1').text(array[1].trim());
            }

            if (typeof array[2] !== 'undefined')
            {
                if (typeof array[1] !== 'undefined')
                {
                    $tmp.find('small').append(' &bull; ');
                }

                $tmp.find('small').append('<span class="select2-tmp-2"></span>');
                $tmp.find('.select2-tmp-2').text(array[2].trim());
            }
        }

        return $tmp;
    };

//======================================================================================================================
// Vendor | Trumbowyg
//======================================================================================================================

    function initTrumbowygEditor(selector)
    {
        const $editor = $(selector);

        if (hash['theme.is_dark_mode'])
        {
            $editor.wrap('<div class="trumbowyg-dark"></div>');
        }
        
        $editor.trumbowyg({
            // We make our language string matches the trumbowyg language string:
            //  pt_BR -> pt_br,
            //  zh_CN -> zh_cn,
            //  zh_TW -> zh_tw
            lang: hash['language'].toLowerCase(),
            changeActiveDropdownIcon: true,
            autogrow: true,
            imageWidthModalEdit: true,
            plugins: {
                colors: {
                    colorList: [
                        'BFEDD2', 'FBEEB8', 'F8CAC6', 'ECCAFA', 'C2E0F4',
                        '2DC26B', 'F1C40F', 'E03E2D', 'B96AD9', '3598DB',
                        '169179', 'E67E23', 'BA372A', '843FA1', '236FA1',
                        'ECF0F1', 'CED4D9', '95A5A6', '7E8C8D', '34495E',
                        '000000', 'FFFFFF'
                    ],
                    allowCustomForeColor: true,
                    allowCustomBackColor: true
                },
                fontsize: {
                    sizeList: ['8pt', '10pt', '12pt', '14pt', '16pt', '18pt', '24pt', '32pt'],
                    allowCustomSize: false
                }
            },
            btns: [
                ['fontsize'],
                ['bold', 'italic', 'underline'],
                ['foreColor', 'backColor'],
                ['justifyLeft', 'justifyCenter', 'justifyRight', 'justifyFull'],
                ['indent', 'outdent'],
                ['unorderedList', 'orderedList'],
                ['link', 'horizontalRule', 'insertImage'],
                ['viewHTML', 'removeformat'],
                ['fullscreen']
            ]
        });
    }

//======================================================================================================================
// Vendor | CodeMirror
//======================================================================================================================

    /**
     * Initialize Codemirror for a textarea.
     *
     * @param    dom object         textarea
     * @param    string             size
     * @param    string             mode
     * @returns  CodeMirror object
     */
    function initCodemirror(textarea, size, mode = 'text/plain')
    {
        editor = CodeMirror.fromTextArea(textarea, {
            lineNumbers: true,
            mode: mode,
            theme: hash['theme.is_dark_mode'] ? 'material-darker' : 'default',
            scrollbarStyle: 'simple',
            extraKeys: {
                "F11": function(cm) {
                    cm.setOption("fullScreen", !cm.getOption("fullScreen"));
                },
                "Esc": function(cm) {
                    if (cm.getOption("fullScreen")) { cm.setOption("fullScreen", false); }
                },
                "Ctrl-F": "findPersistent",
                "Ctrl-H": "replace"
            }
        });

        editor.setSize(null, size);

        return editor;
    }