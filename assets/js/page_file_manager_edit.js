//======================================================================================================================
// General variables
//=======================================================================================================================

    var $form = $('form');

    var editor = initCodemirror($('textarea[name="content"]')[0], '50em', 'text/plain');

//======================================================================================================================
// Alert on unsaved changes
//======================================================================================================================

    editor.on('change', function() {
        $form.addClass('app-unsaved-changes');
    });

    $form.submit(function() {
       $(window).unbind('beforeunload');
    });

    $(window).on('beforeunload', function () {
        if ($form.hasClass('app-unsaved-changes'))
        {
            // this messages is only displayed in old browsers (Chrome 51+ (Mid 2016), Safari 9.1+ (Mid 2016) etc)
            // No need to worry about i18n -> users should update their antique browsers.
            return "Unsaved changes detected, are you sure you want to continue?";
        }
    });

//======================================================================================================================
// Available syntax highlighting
//======================================================================================================================

    var syntaxHighlight = {
        html: {
            extensions: ['html', 'htm'],
            mode: 'text/html',
            mode_files: ['xml', 'htmlmixed', 'javascript', 'css']
        },
        php: {
            extensions: ['php'],
            mode: 'application/x-httpd-php',
            mode_files: ['xml', 'htmlmixed', 'javascript', 'css', 'clike', 'php']
        },
        css: {
            extensions: ['css'],
            mode: 'text/css',
            mode_files: ['css']
        },
        javascript: {
            extensions: ['js'],
            mode: 'text/javascript',
            mode_files: ['javascript']
        },
        json: {
            extensions: ['json', 'map'],
            mode: 'application/json',
            mode_files: ['javascript']
        },
        xml: {
            extensions: ['xml', 'wsdl'],
            mode: 'application/xml',
            mode_files: ['xml']
        },
        lua: {
            extensions: ['lua'],
            mode: 'text/x-lua',
            mode_files: ['lua']
        },
        yaml: {
            extensions: ['yaml', 'yml'],
            mode: 'text/x-yaml',
            mode_files: ['yaml']
        },
        twig: {
            extensions: ['twig'],
            mode: 'twig',
            mode_files: ['twig']
        },
        sql: {
            extensions: ['sql'],
            mode: 'text/x-mariadb',
            mode_files: ['sql']
        },
        sh: {
            extensions: ['sh'],
            mode: 'text/x-sh',
            mode_files: ['shell']
        },
        perl: {
            extensions: ['pl'],
            mode: 'text/x-perl',
            mode_files: ['perl']
        },
        python: {
            extensions: ['py'],
            mode: 'text/x-python',
            mode_files: ['python']
        },
        markdown: {
            extensions: ['md', 'markdown', 'markdn', 'mdown'],
            mode: 'text/x-markdown',
            mode_files: ['markdown']
        },
        scss: {
            extensions: ['scss'],
            mode: 'text/x-scss',
            mode_files: ['css']
        },
        less: {
            extensions: ['less'],
            mode: 'text/x-less',
            mode_files: ['css']
        }
    };

    for (var key in syntaxHighlight)
    {
        var item = syntaxHighlight[key];
        var extensionFound = item['extensions'].indexOf(fileExtension) !== -1;

        if (extensionFound)
        {
            var loaded = 0;
            var totalToLoad = item['mode_files'].length;

            for (var keyMode in item['mode_files'])
            {
                var src = '/theme/bulma/assets/vendor/codemirror/mode/' + item['mode_files'][keyMode] + '.js?' + cacheBusting;

                $.getScript(src, function () {
                    loaded++;
                    if (loaded === totalToLoad)
                    {
                        editor.setOption('mode', item['mode']);
                    }
                });
            }

            break;
        }
    }

//======================================================================================================================
// Apply button hit
//======================================================================================================================

    // Trigger: [CRTL] + [S]
    $(window).bind('keydown', function(event) {
        if (event.ctrlKey || event.metaKey)
        {
            if (String.fromCharCode(event.which).toLowerCase() === 's')
            {
                event.preventDefault();
                $('#app-ajax-save').trigger('click');
            }
       }
    });

    $('#app-ajax-save').click(function() {
        var $this = $(this);

        ajax({
            action: 'file_manager_save_file',
            data: {
                id: $('input[name=id]').val(),
                working_dir: $('input[name=working_dir]').val(),
                content: editor.getValue()
            },
            success: function(data)
            {
                $form.removeClass('app-unsaved-changes');

                animateButton($this, !data.error);

                if (data.error)
                {
                    console.log('Error: ' + data.error_msg);
                }
            },
            beforeSend: function()
            {
                $this.addClass('is-loading');
            },
            complete: function()
            {
                $this.removeClass('is-loading');
            }
        });
    });


