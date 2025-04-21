import dynamic from 'next/dynamic'
import React from 'react'
import {CardBody} from 'reactstrap'
import {TimeLineChartData} from './Timeline'
import {TimeLineChartProps} from "./types";


const ReactApexChart = dynamic(() => import('react-apexcharts'), {ssr: false})

const TimeLineChart = ({series,height}: TimeLineChartProps) => {

    return (<CardBody className='pt-0'>
            <div className='schedule-container'>
                <ReactApexChart height={height} type='rangeBar' options={TimeLineChartData.options} series={series}/>
            </div>
        </CardBody>)
}

export default TimeLineChart