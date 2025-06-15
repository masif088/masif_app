import TimeLineCard from "@/components/TimeLineCard";
import PaperNote from "src/components/PaperNote";
import Breadcrumbs from "CommonElements/Breadcrumbs";
import React from "react";
import {Col, Container, Row} from "reactstrap";
import {Dashboard, Default_Util, ImgPath, MenuWallet, Welcometext, Welcometocuba, WhatsNew} from "utils/Constant";
import GreetingCard from "@/components/GreetingCard";
import Widgets1 from "../../../../CommonElements/Widgets1";
import {Widgets2Data, Widgets2Data2, WidgetsData3} from "@/Data/Dashboard/DefaultData";
import InfoCard from "@/components/InfoCard";
import OrderProfit from "@/components/dashboard/WidgetsWrapper/OrderProfit";
import GoodsReturn from "@/components/dashboard/WidgetsWrapper/GoodsReturn";
import Widgets2 from "../../../../CommonElements/Widgets2";

const Wallet = () => {
    return (<div className="page-body">
        <Breadcrumbs
            title={MenuWallet}
            mainTitle={MenuWallet}
            parent={MenuWallet}
        />
        <Container fluid={true}>
            <Row className="widget-grid">
                <Col xl={4} sm={4} className='box-col-3'>
                    asd
                </Col>    
            </Row>
        </Container>
    </div>);
};

export default Wallet;
