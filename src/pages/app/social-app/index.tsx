import AboutTab from "@/components_source/app/SocialApp/AboutTab";
import AllCards from "@/components_source/app/SocialApp/AllCards";
import PhotosTab from "@/components_source/app/SocialApp/PhotosTab";
import TimelineTab from "@/components_source/app/SocialApp/TimelineTab";
import UserProfile from "@/components_source/app/SocialApp/UserProfile";
import Breadcrumbs from "CommonElements/Breadcrumbs";
import { useCallback, useState } from "react";
import { Container, Row, TabContent, TabPane } from "reactstrap";
import { Apps, SocialAppHeading } from "utils/Constant";

const SocialApp = () => {
  const [activeTab, setActiveTab] = useState(1);
  const callback = useCallback((tab: number) => {
    setActiveTab(tab);
  }, []);
  return (
    <div className="page-body">
      <Breadcrumbs title={SocialAppHeading} mainTitle={SocialAppHeading} parent={Apps}/>
      <Container fluid>
        <div className="user-profile social-app-profile">
          <UserProfile callback={callback} />
          <TabContent activeTab={activeTab} className="tab-content">
            <TabPane tabId={1}>
              <TimelineTab />
            </TabPane>
            <TabPane tabId={2}>
              <AboutTab />
            </TabPane>
            <TabPane tabId={3}>
              <Row>
                <AllCards />
              </Row>
            </TabPane>
            <TabPane tabId={4}>
              <Row>
                <PhotosTab />
              </Row>
            </TabPane>
          </TabContent>
        </div>
      </Container>
    </div>
  );
};

export default SocialApp;
