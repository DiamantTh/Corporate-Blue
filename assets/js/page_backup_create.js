//======================================================================================================================
// Backup interval
//======================================================================================================================

    $('select[name="interval"]').change(function() {
        var $this = $(this);

        var $time = $('#app-time');
        var $minutes = $('#app-minutes');
        var $weekdays = $('#app-weekdays');
        var $daysOfMonth = $('#app-days-of-month');

        var $minutesInput = $minutes.find('input');
        var $timeInput = $time.find('input');

        // Hide all
        $time.hide();
        $minutes.hide();
        $weekdays.hide();
        $daysOfMonth.hide();

        // Remove required from all.
        $minutesInput.prop('required', false);
        $timeInput.prop('required', false);

        if ($this.val() === 'hourly')
        {
            $minutes.show(200);
            $minutesInput.prop('required', true);
        }
        else
        {
            $time.show(200);
            $timeInput.prop('required', true);

            if ($this.val() === 'weekly')
            {
                $weekdays.show(200);
            }

            if ($this.val() === 'monthly')
            {
                $daysOfMonth.show(200);
            }
        }

    }).trigger('change');

//======================================================================================================================
// Backup scope
//======================================================================================================================

    // Show / hide custom scope settings.
    $('input[name="scope"]').change(function() {
        var $this = $(this);
        var $div = $('.app-show-with-custom-scope');

        $this.is(':checked') && $this.val() === 'custom' ? $div.show(200) : $div.hide();
    }).trigger('change');


    // Show paths selection and path exclude option.
    $('input[name="is_paths"]').change(function() {
        var $this = $(this);
        var $div = $('.app-show-with-paths');

        $this.is(':checked') ? $div.show(200) : $div.hide();
    }).trigger('change');

    // Show exclude selection.
    $('input[name="is_exclude_paths"]').change(function() {
        var $this = $(this);
        var $div = $('.app-show-with-exclude-paths');

        $this.is(':checked') ? $div.show(200) : $div.hide();
    }).trigger('change');


    // Show user selection.
    $('input[name="is_user_accounts"]').change(function() {
        var $this = $(this);
        var $div = $('.app-show-with-user-accounts');

        $this.is(':checked') ? $div.show(200) : $div.hide();
    }).trigger('change');

    // Show with user selection requiring a user list.
    $('select[name="user_scope"]').change(function() {
        var $this = $(this);
        var $div = $('.app-show-with-user-accounts-list');

        $this.val() === 'include' || $this.val() === 'exclude' ? $div.show(200) : $div.hide();
    }).trigger('change');