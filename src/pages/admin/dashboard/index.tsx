import TimeLineCard from "@/components/TimeLineCard";
import PaperNote from "src/components/PaperNote";
import Breadcrumbs from "CommonElements/Breadcrumbs";
import React from "react";
import {Col, Container, Row} from "reactstrap";
import {Default_Util, ImgPath, Welcometext, Welcometocuba, WhatsNew} from "utils/Constant";
import GreetingCard from "@/components/GreetingCard";
import Widgets1 from "../../../../CommonElements/Widgets1";
import {Widgets2Data, Widgets2Data2, WidgetsData3} from "@/Data/Dashboard/DefaultData";
import InfoCard from "@/components/InfoCard";
import OrderProfit from "@/components/dashboard/WidgetsWrapper/OrderProfit";
import GoodsReturn from "@/components/dashboard/WidgetsWrapper/GoodsReturn";
import Widgets2 from "../../../../CommonElements/Widgets2";

const Dashboard = () => {
    return (<div className="page-body">
        <Breadcrumbs
            title={"Dashboard"}
            mainTitle={"Dashboard"}
            parent={"Dashboard"}
        />

        <Container fluid={true}>
            <Row className="widget-grid">
                <GreetingCard
                    imgPath={ImgPath}
                    welcomeText={Welcometext}
                    welcomeTitle={Welcometocuba}
                    whatsNewText={WhatsNew}
                    linkText={"http://www.google.com"}

                />
                <Col xl={2} sm={2} className='box-col-3'>
                    <Row>
                        <Col xl={12}>
                            <InfoCard
                                title={'Sales'}
                                gros={70}
                                total={'4,201'}
                                color={'warning'}
                                icon={'tag'}
                            />
                        </Col>
                        <Col xl={12}>
                            <InfoCard
                                title={'Sales'}
                                gros={70}
                                total={'4,201'}
                                color={'warning'}
                                icon={'tag'}
                            />
                        </Col>

                    </Row>
                </Col>

                <Col xl={3} sm={2} className='box-col-3'>
                    <Row>
                        <Col xl={12}>
                            <InfoCard
                                title={'Sales'}
                                gros={70}
                                total={'4,201'}
                                color={'warning'}
                                icon={'tag'}
                            />
                        </Col>
                        <Col xl={12}>
                            <InfoCard
                                title={'Sales'}
                                gros={70}
                                total={'4,201'}
                                color={'warning'}
                                icon={'tag'}
                            />
                        </Col>

                    </Row>
                </Col>

                {/*<GoodsReturn />*/}
                <Col xl={3} sm={3} className='box-col-3'>
                    <Row>
                        <Col xxl={12} className='box-col-12'>
                            <Widgets2 data={Widgets2Data} />
                        </Col>
                        <Col xxl={12} xl={6} className='box-col-12'>
                            <Widgets2 chartClass='profit-chart' data={Widgets2Data2} />
                        </Col>
                    </Row>
                </Col>
                {/*<OrderProfit />*/}
                {/*<OverBalance />*/}
                {/*<RecentOrders />*/}
                {/*<ActivityCard />*/}
                {/*<RecentSales />*/}
                <Col xxl={6} md={6} className="appointment-sec box-col-6">

                    <TimeLineCard
                        title="Project Timeline"
                        height={400}
                        series={[{
                            name: 'Project Ab', data: [{
                                x: "Analysis", y: [new Date("2022-01-01").getTime(), new Date("2022-02-28").getTime(),],
                            }, {
                                x: "Design", y: [new Date("2022-02-20").getTime(), new Date("2022-04-08").getTime(),],
                            }, {
                                x: "UI-UX", y: [new Date("2022-02-20").getTime(), new Date("2022-04-08").getTime(),],
                            },],
                        }, {
                            name: 'Project B', data: [{
                                x: "Analysis", y: [new Date("2022-02-01").getTime(), new Date("2022-02-28").getTime(),],
                            }, {
                                x: "Design", y: [new Date("2022-03-20").getTime(), new Date("2022-04-08").getTime(),],
                            },],
                        },]}
                    />

                </Col>

                {/*<PreAccountCard />*/}
                {/*<TotalUserAndFollower />*/}
                <PaperNote/>
            </Row>
        </Container>
    </div>);
};

export default Dashboard;
