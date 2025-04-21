import ConfigDB from "../../../config/ThemeConfig";

const primary = ConfigDB.data.color.primary_color;

// TimeLine Chart //
export const TimeLineChartData = {
    options: {
        chart: {
            type: "rangeBar", toolbar: {
                show: true, offsetY: -30
            },
        },

        plotOptions: {
            bar: {
                horizontal: true, distributed: true, dataLabels: {
                    hideOverflowingLabels: true,
                },
            },
        }, dataLabels: {
            enabled: true, formatter: function (val: any, opts: any) {
                return opts.w.globals.labels[opts.dataPointIndex];
            }, background: {
                enabled: true,
                foreColor: "#52526C",
                padding: 10,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: "var(--white)",
                opacity: 0.9,
            },
        }, xaxis: {
            type: "datetime", position: "top",
        },

        yaxis: {
            axisBorder: {
                show: true,
            }, axisTicks: {
                show: true,
            },
        }, grid: {
            row: {
                colors: ["var(--light-background)", "var(--white)"], opacity: 1,
            },
        }, responsive: [{
            breakpoint: 576, options: {
                yaxis: {
                    labels: {
                        show: false,
                    },
                }, grid: {
                    padding: {
                        left: -10,
                    },
                },
            },
        },],
    },
};

