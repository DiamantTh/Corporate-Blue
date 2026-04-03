// Internationalization:
// - https://www.chartjs.org/docs/latest/configuration/locale.html
// - By default the chart is using the default locale of the platform which is running on.
// - options: { locale: 'en' }
// - we override it in various places, as we use the Intl.NumberFormat

function getNumberFormat(decimals = 0)
{
    return new Intl.NumberFormat(hash['language'].replace('_', '-'), { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

var numberFormatInt = getNumberFormat(0);
var numberFormatFloat = getNumberFormat(2);
var numberFormatFloat3 = getNumberFormat(3);


var charts = $('.app-chart');

charts.each(function() {
    var datasets = $(this).data('chart-datasets');
    var yAxis = $(this).data('chart-y-axis');
    var isDark = hash['theme.is_dark_mode'];

    // Y-axis / tooltip formatters
    var yFormatter, tooltipValueFormatter;

    switch (yAxis)
    {
        case 'percent':
            yFormatter = function(v) { return v + '%'; };
            tooltipValueFormatter = function(v) { return v.toFixed(2) + '%'; };
            break;

        case 'integer':
            yFormatter = function(v) { return Number.isInteger(v) ? numberFormatInt.format(v) : null; };
            tooltipValueFormatter = function(v) { return numberFormatInt.format(Math.round(v)); };
            break;

        case 'float':
            yFormatter = null;
            tooltipValueFormatter = function(v) { return numberFormatFloat.format(v); };
            break;

        case 'bytes':
            yFormatter = function(v) { return formatBytes(v, 1); };
            tooltipValueFormatter = function(v) { return formatBytes(v, 1); };
            break;

        case 'time':
            yFormatter = function(v) { return v + ' ms'; };
            tooltipValueFormatter = function(v) { return numberFormatFloat3.format(v) + ' ms'; };
            break;

        default:
            yFormatter = null;
            tooltipValueFormatter = function(v) { return v; };
    }

    var ecColors = [
        isDark ? '#3273DC' : '#36A2EB',
        isDark ? '#FF2B56' : '#FF6384',
        isDark ? '#FFDD57' : '#FF9F40',
        isDark ? '#0CA661' : '#4BC0C0',
        isDark ? '#FF8457' : '#FFCD56',
        '#9966FF',
        isDark ? '#3D3D3D' : '#C9CBCF'
    ];

    var locale = hash['language'].replace('_', '-');

    var ecSeries = datasets.map(function(ds, i) {
        var color = ecColors[i] || '#888888';
        // Support both {x,y} objects and plain y-value arrays
        var seriesData = Array.isArray(ds.data) && typeof ds.data[0] === 'object' && ds.data[0] !== null
            ? ds.data.map(function(p) { return [p.x, p.y]; })
            : graphDataPoints.map(function(t, idx) { return [t, ds.data[idx]]; });

        return {
            name: ds.label || '',
            type: 'line',
            smooth: 0.3,
            symbol: 'none',
            data: seriesData,
            lineStyle: { color: color, width: 2.5 },
            areaStyle: {
                color: {
                    type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
                    colorStops: [
                        { offset: 0, color: color + (isDark ? '90' : '80') },
                        { offset: 1, color: color + '08' }
                    ]
                }
            }
        };
    });

    echarts.init(this).setOption({
        backgroundColor: 'transparent',
        animation: false,
        legend: {
            bottom: 0,
            align: 'left',
            textStyle: { color: isDark ? '#ccc' : '#555', fontSize: 12 }
        },
        tooltip: {
            trigger: 'axis',
            formatter: function(params) {
                var d = new Date(params[0].value[0]);
                var dateStr = d.toLocaleDateString(locale, {
                    year: 'numeric', month: '2-digit', day: '2-digit',
                    hour: '2-digit', minute: '2-digit', hour12: false
                });
                var lines = [dateStr];
                params.forEach(function(p) {
                    lines.push(
                        '<span style="display:inline-block;margin-right:4px;border-radius:50%;width:10px;height:10px;background:' + p.color + '"></span>'
                        + (p.seriesName ? p.seriesName + ': ' : '')
                        + tooltipValueFormatter(p.value[1])
                    );
                });
                return lines.join('<br>');
            }
        },
        grid: { left: 60, right: 20, top: 15, bottom: 50 },
        xAxis: {
            type: 'time',
            axisLabel: {
                color: isDark ? '#aaa' : '#888',
                fontSize: 11,
                formatter: function(v) {
                    var d = new Date(v);
                    return (d.getHours() < 10 ? '0' : '') + d.getHours() + ':' + (d.getMinutes() < 10 ? '0' : '') + d.getMinutes();
                },
                hideOverlap: true,
                showMaxLabel: true
            },
            splitLine: { show: false },
            axisLine: { lineStyle: { color: isDark ? '#444' : '#ddd' } }
        },
        yAxis: {
            type: 'value',
            min: 0,
            axisLabel: {
                color: isDark ? '#aaa' : '#888',
                fontSize: 11,
                formatter: yFormatter || undefined
            },
            splitLine: { lineStyle: { color: isDark ? '#333' : '#eee' } }
        },
        series: ecSeries
    });
});