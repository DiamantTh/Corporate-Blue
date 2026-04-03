tippy('.app-tooltip-mail-header', $.extend(tippySettingsTooltipMandatory, {
    content: '...',
    flipOnUpdate: true,
    onShow: function(instance) {
        var queueId = $(instance.reference).data('queue-id');

        ajax({
            action: 'get_mail_header',
            data:
            {
                queue_id: queueId
            },
            success: function(response)
            {
                var html;

                if (response.error)
                {
                    html = '<p>' + response.error_msg.replace(/\n/, '<br>') + '</p>';
                }
                else
                {
                    html = '<pre class="has-padding-small">' + response.header + '</pre>';
                }

                $html = $(html);

                instance.setContent($html[0]);
            },
            error: function(textStatus, error)
            {
                instance.setContent('AJAX_ERROR');
                ajaxLogError(textStatus, error);
            }
        });
    },
    onHidden: function(instance) {
        instance.setContent('...');
    }
}));