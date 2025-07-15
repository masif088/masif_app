import TimeLineCard from "@/components/TimeLineCard";
import PaperNote from "src/components/PaperNote";
import Breadcrumbs from "CommonElements/Breadcrumbs";
import React, { useState } from "react";
import {Button, Col, Container, Row} from "reactstrap";
import {Default_Util, ImgPath, Welcometext, Welcometocuba, WhatsNew} from "utils/Constant";
import GreetingCard from "@/components/GreetingCard";
import Widgets1 from "../../../../CommonElements/Widgets1";
import {Widgets2Data, Widgets2Data2, WidgetsData3} from "@/Data/Dashboard/DefaultData";
import InfoCard from "@/components/InfoCard";
import OrderProfit from "@/components/dashboard/WidgetsWrapper/OrderProfit";
import GoodsReturn from "@/components/dashboard/WidgetsWrapper/GoodsReturn";
import Widgets2 from "../../../../CommonElements/Widgets2";
import Cookies from "js-cookie";
import { toast } from "react-toastify";

const Dashboard = () => {
    const [fetchingEmails, setFetchingEmails] = useState(false);

    const handleFetchEmails = async () => {
        // if (!activity) return;
        
        setFetchingEmails(true);
        try {
            const user = JSON.parse(Cookies.get("user") || "{}");
            const response = await fetch('/api/imap/fetch-emails', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
        
                    userId: user.id,
                    days: 7 // Fetch emails from last 7 days
                })
            });
        

            const data = await response.json();

            if (response.ok) {
                toast.success(data.message);
                fetchActivityNotes(); // Refresh notes to show new emails
            } else {
                toast.error(data.message || 'Failed to fetch emails');
            }
        } catch (error) {
            console.error('Error fetching emails:', error);
            toast.error('Failed to fetch emails from inbox');
        } finally {
            setFetchingEmails(false);
        }
    };

    const fetchActivityNotes = async () => {
        try {
            // const data = await ActivityService.getActivityNotes(Number(id));
            // setNotes(data);
        } catch (error) {
            console.error("Error fetching notes:", error);
            toast.error("Failed to load notes");
        }
    };


    return (<div className="page-body">
        <Breadcrumbs
            title={"Dashboard"}
            mainTitle={"Dashboard"}
            parent={"Dashboard"}
        />

        <Container fluid={true}>

        <Button
                                                color="info"
                                                size="sm"
                                                onClick={handleFetchEmails}
                                                disabled={fetchingEmails}
                                            >
                                                {fetchingEmails ? (
                                                    <>
                                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                        Fetching...
                                                    </>
                                                ) : (
                                                    <>
                                                        <i className="icon-inbox"></i> Fetch Emails
                                                    </>
                                                )}
                                            </Button>
                                            <br /><br />
                                            
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
