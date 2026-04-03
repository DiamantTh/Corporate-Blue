var action = getUrlQueryParameterValue(window.location.href, 'action');
action = ['select', 'restore'].indexOf(action) >= 0 ? action : 'select';

//======================================================================================================================
// Action: Select
//======================================================================================================================

if (action === 'select')
{
    //==================================================================================================================
    // Fills the table with snapshots based on the selected repository
    //==================================================================================================================

    var snapshotTemplate = Handlebars.compile($('#app-snapshot-template').html());
    var $repoSelect = $('select[name="repo_id"]');
    var $snapshotContainer = $('#app-snapshot-container');
    var $noItems = $('#app-no-items-available');
    var $itemTable = $('#app-item-table');

    $repoSelect.change(function() {
        var $this = $(this);
        var idRepo = $this.val();

        $noItems.hide();
        $itemTable.hide();
        $snapshotContainer.html('');

        if (snapshots[idRepo].length > 0)
        {
            var item = snapshots[idRepo];
            $itemTable.show(200);

            for (var i in item)
            {
                $snapshotContainer.append(snapshotTemplate({
                    id:             item[i].id,
                    time:           item[i].time,
                    email_count:    item[i].email_count,
                    database_count: item[i].database_count,
                    path_count:     item[i].path_count,
                    size_raw:       item[i].size_raw,
                    size_restore:   item[i].size_restore,
                    description:    item[i].description
                }));
            }
        }
        else
        {
            $noItems.show(200);
        }
    }).trigger('change');

    // When using the back button of the browser, the site is build from cache.
    // The selectedIndex is 0 when calling the page, but as it was build from cache, this must not be the case.
    // Here we set it manually again, to ensure the correct items inside of the table will be shown.
    $(document).ready(function () {
        var selectedValue = $repoSelect.find('option[selected]').val();

        if (selectedValue)
        {
            // Triggers when using id_repository URL parameter.
            $repoSelect.val(selectedValue);
        }
        else
        {
            // Triggers when using the back button.
            $repoSelect.prop('selectedIndex', 0);
        }
    });
}

//======================================================================================================================
// Action: Restore
//======================================================================================================================

if (action === 'restore')
{
    //==================================================================================================================
    // Build lookup table, to speed up searching
    //==================================================================================================================

        var searchElements = {};

        $('.app-restore-category').each(function() {
            var $this = $(this);
            var category = $(this).data('category');

            searchElements[category] = [];

            $this.find('.app-elements').find('.field').each(function() {
                var $this = $(this);

                searchElements[category].push({
                   element: $this,
                   label: $this.find('label').text().trim().toLowerCase()
                });
            });
        });

    //==================================================================================================================
    // Searching
    //==================================================================================================================

        $('input[name="search"]').on('input', function() {
            var $this = $(this);
            var category = $this.closest('.app-restore-category').data('category');

            var search = $this.val().trim().toLowerCase();

            for (var i = 0; i < searchElements[category].length; i++)
            {
                var isMatchSearch = searchElements[category][i]['label'].toLowerCase().indexOf(search) !== -1;

                // I've tested with 10.000 elements, .show() / .hide() could be to slow, let's use css() which is faster.
                isMatchSearch ? searchElements[category][i]['element'].css("display", "block") : searchElements[category][i]['element'].css("display", "none");
            }
        });

    //==================================================================================================================
    // Buttons
    //==================================================================================================================

        $('.app-select-filtered').click(function() {
            var $elementContainer = $(this).closest('.app-restore-category').find('.app-elements');

            $elementContainer.find('.field').each(function() {
                var $this = $(this);
                $this.is(":visible") ? $this.find('input:not(:disabled)').prop('checked', true).trigger('change') : false;
            });
        });

        $('.app-select-all').click(function() {
            $(this).closest('.app-restore-category').find('.app-elements').find('input[type="checkbox"]:not(:disabled)').prop('checked', true).trigger('change');
        });

        $('.app-deselect-all').click(function() {
            $(this).closest('.app-restore-category').find('.app-elements').find('input[type="checkbox"]').prop('checked', false).trigger('change');
        });

    //==================================================================================================================
    // Restore SQL
    //==================================================================================================================

        const disabledDatabaseElements = [];

        $('.app-restore-category[data-category="databases"]').find('.app-elements').find('input[type="checkbox"]').each(function() {
            const $this = $(this);
            if ($this.is(':disabled'))
            {
                disabledDatabaseElements.push($this);
            }
        });

        $('input[name="is_restore_sql"]').change(function() {
            const $this = $(this);
            const $div = $('.app-show-with-restore-sql');
            const isChecked = $this.is(':checked');

            isChecked ? $div.show(200) : $div.hide();

            disabledDatabaseElements.forEach($element => {
                $element.prop('disabled', !isChecked);

                const $span = $element.siblings('span');
                isChecked ? $span.removeClass('has-text-grey') : $span.addClass('has-text-grey');
            });

        }).trigger('change');

    //==================================================================================================================
    // Restore single path
    //==================================================================================================================

        $('input[name="is_restore_single_path"]').change(function() {
            const $this = $(this);
            const $div = $('.app-show-with-restore-single-path');
            const isChecked = $this.is(':checked');

            isChecked ? $div.show(200) : $div.hide();
        }).trigger('change');

    //==================================================================================================================
    // Restore location
    //==================================================================================================================

        $('input[name="is_restore_single_path"], input[name="paths[]"]').change(function() {
            let isChecked = false;
            const $div = $('.app-show-with-paths');

            $('input[name="is_restore_single_path"], input[name="paths[]"]').each(function() {
                const $this = $(this);

                if ($this.is(':checked'))
                {
                    isChecked = true;
                    return false;
                }
            });

            isChecked ? $div.show(200) : $div.hide();
        }).trigger('change');

        $('input[name="restore_location"]').change(function () {
            var $this = $(this);
            var $div = $('.app-show-with-alternative-restore-path');


            if ($this.val() === 'alternative' && $this.is(':checked'))
            {
                $div.show(200);

            }
            else
            {
                $div.hide();

            }
        }).trigger('change');
}