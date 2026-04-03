//======================================================================================================================
// Gathering data
//======================================================================================================================

    var workingDir = $('input[name="working_dir"]').val();

    $('.app-gather-data').click(function() {
        var $this = $(this);
        var column = $this.closest('td').data('column');
        var $tds = $('td[data-column="' + column + '"]');

        var $triggers = $tds.find('.app-gather-data');
        var $loadingIndicators = $tds.find('.app-loading');
        var $values = $tds.find('.app-value');

        ajax({
            action: 'get_disk_usage',
            data: {
                gather_type: column,
                working_dir: workingDir
            },
            success: function(response)
            {
                if (!response.error && Object.keys(response.items).length > 0)
                {
                    for (var key in response.items)
                    {
                        var item = response.items[key][column];
                        var $row = $('tr[data-path="' + key + '"]');
                        var $columnInRow = $row.find('td[data-column="' + column + '"]');

                        $columnInRow.find('.app-value').html(item.value);

                        if (key === workingDir)
                        {
                            continue;
                        }

                        // Progressbar
                        $columnInRow.find('progress').val(item.share);
                        $columnInRow.find('progress').text(item.share_formatted);
                        $columnInRow.find('.level-right > .level-item').text(item.share_formatted);

                        // Update tooltip texts
                        // Because the tooltips did exist at page load, the first line alone is not sufficient
                        // https://atomiks.github.io/tippyjs/v5/faq/#changing-data-tippy-attributes-does-not-update-the-tooltip
                        $columnInRow.find('.usage-indicator').attr('data-tippy-content', item.share_formatted);
                        $columnInRow.find('.usage-indicator').prop('_tippy').setProps({content: item.share_formatted});
                    }
                }
            },
            error: function(textStatus, error)
            {
                $values.html('AJAX_ERROR / TIMEOUT');
                ajaxLogError(textStatus, error);
            },
            beforeSend: function()
            {
                $triggers.hide();
                $loadingIndicators.show();
            },
            complete: function()
            {
                $loadingIndicators.hide();
            }
        });
    });

//======================================================================================================================
// Trigger auto gathering
//======================================================================================================================

    var triggerGatherSize = $('input[name="gather_size"]').val();
    var triggerGatherInodes = $('input[name="gather_inodes"]').val();

    if (triggerGatherSize)
    {
        $('td[data-column="size"] .app-gather-data')[0].click();
    }

    if (triggerGatherInodes)
    {
        $('td[data-column="inodes"] .app-gather-data')[0].click();
    }