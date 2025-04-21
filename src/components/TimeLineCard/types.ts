export interface TimelineDataItem {
    x: string;
    y: [number, number];
}

export interface TimelineSeries {
    name: string;
    data: TimelineDataItem[];
}

export interface TimeLineCardProps {
    title: string;
    series: TimelineSeries[];
    height: number;
}

export interface TimeLineChartProps {
    series: TimelineSeries[];
    height: number;
}