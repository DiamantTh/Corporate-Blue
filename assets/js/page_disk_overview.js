//======================================================================================================================
// Action: index
//======================================================================================================================

    var canvas = $('.app-chart');
    var isDark = hash['theme.is_dark_mode'];

    canvas.each(function() {
        var config = $(this).data('chart');
        var colors = ['#FF2B56', '#3273DC', (isDark ? '#3D3D3D' : '#CCCCCC')];
        var eData = config.data.map(function(v, i) {
            return { value: v, name: config.labels[i], itemStyle: { color: colors[i] } };
        });

        echarts.init(this).setOption({
            backgroundColor: 'transparent',
            tooltip: { trigger: 'item', formatter: '{b}: {d}%' },
            series: [{
                type: 'pie',
                radius: ['45%', '72%'],
                itemStyle: {
                    borderRadius: 6,
                    borderColor: isDark ? '#222' : '#fff',
                    borderWidth: 2
                },
                label: { show: false },
                emphasis: { label: { show: true, fontSize: 13, fontWeight: 'bold' } },
                data: eData
            }]
        });
    });