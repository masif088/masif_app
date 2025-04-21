import EventCalendar from "@/components_source/Dashboard/SchoolManagenement/EventCalendar";
import KnowledgeIncrease from "@/components_source/Dashboard/SchoolManagenement/KnowledgeIncrease";
import NoticeBoard from "@/components_source/Dashboard/SchoolManagenement/NoticeBoard";
import SchoolData from "@/components_source/Dashboard/SchoolManagenement/SchoolData";
import StudentLeader from "@/components_source/Dashboard/SchoolManagenement/StudentLeader";
import TodayTask from "@/components_source/Dashboard/SchoolManagenement/TodayTask";
import Breadcrumbs from "CommonElements/Breadcrumbs";
import dynamic from "next/dynamic";
import { Col, Container, Row } from "reactstrap";
import { SchoolManage, SchoolManagementHeading } from "utils/Constant";

const SchoolManagement = () => {
   const AcademicPerformance = dynamic(() => import('@/components_source/Dashboard/SchoolManagenement/AcademicPerformance'), { ssr: false });
   const SchoolPerformance = dynamic(() => import('@/components_source/Dashboard/SchoolManagenement/SchoolPerformance'), { ssr: false });
   const SchoolIncome = dynamic(() => import('@/components_source/Dashboard/SchoolManagenement/SchoolIncome/index'), { ssr: false });
   const OverViewPerformance = dynamic(() => import('@/components_source/Dashboard/SchoolManagenement/OverViewPerformance'), { ssr: false });
  return (
    <div className="page-body">
      <Breadcrumbs
        title={SchoolManage}
        mainTitle={SchoolManagementHeading}
        parent="Dashboard"
      />
      <Container fluid={true}>
        <Row>
          <Col xxl={9} className="box-col-12">
            <Row>
              <AcademicPerformance />
              <SchoolPerformance />
              <SchoolData />
              <SchoolIncome />
              <OverViewPerformance/>
              <EventCalendar/>
              <TodayTask/>
            </Row>
          </Col>
          <Col xxl={3} className="d-xxl-block d-none box-col-none">
            <Row>
              <KnowledgeIncrease/>
              <NoticeBoard/>
              <StudentLeader/>
            </Row>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default SchoolManagement;
