import GreetingCard from "@/components_source/Dashboard/Default/GreetingCard";
import GoodsReturn from "@/components_source/Dashboard/Default/WidgetsWrapper/GoodsReturn";
import OrderProfit from "@/components_source/Dashboard/Default/WidgetsWrapper/OrderProfit";
import SalePurchase from "@/components_source/Dashboard/Default/WidgetsWrapper/SalePurchase";
import OverBalance from "@/components_source/Dashboard/Default/OverBalance";
import RecentOrders from "@/components_source/Dashboard/Default/RecentOrders";
import ActivityCard from "@/components_source/Dashboard/Default/ActivityCard";
import RecentSales from "@/components_source/Dashboard/Default/RecentSales";
import TimeLineCard from "@/components_source/Dashboard/Default/TimeLineCard";
import PaperNote from "@/components_source/Dashboard/Default/PaperNote";
import TotalUserAndFollower from "@/components_source/Dashboard/Default/TotalUserAndFollower";
import Breadcrumbs from "CommonElements/Breadcrumbs";
import React from "react";
import { Container, Row } from "reactstrap";
import { Dashboard, Default_Util } from "utils/Constant";
import PreAccountCard from "@/components_source/Dashboard/Default/PreAcoountCard/Index";

const Default = () => {
  return (
    <div className="page-body">
      <Breadcrumbs
        title={Default_Util}
        mainTitle={Default_Util}
        parent={Dashboard}
      />
      <Container fluid={true}>
        <Row className="widget-grid">
          <GreetingCard />
          <SalePurchase />
          <GoodsReturn />
          <OrderProfit />
          <OverBalance />
          <RecentOrders />
          <ActivityCard />
          <RecentSales />
          <TimeLineCard />
          <PreAccountCard />
          <TotalUserAndFollower />
          <PaperNote />
        </Row>
      </Container>
    </div>
  );
};

export default Default;
