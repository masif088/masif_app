import React from 'react'
import {Card, CardHeader} from 'reactstrap'
import TimeLineChart from "./TimeLineChart";
import {TimeLineCardProps} from "./types";

const TimeLineCard = ({title, series, height}: TimeLineCardProps) => {
    return (<div className="appointment">
            <Card>
                <CardHeader className="card-no-border">
                    <div className="header-top">
                        <h5 className="m-0">{title}</h5>
                        <div className="card-header-right-icon">
                            {/*<DropdownCommon icon={false} options={DailyDropdown} btn={{ caret: true, color: 'Outline-primary' }} /> */}
                        </div>
                    </div>
                </CardHeader>
                <TimeLineChart series={series} height={height}/>
            </Card>
        </div>);
}
export default TimeLineCard;