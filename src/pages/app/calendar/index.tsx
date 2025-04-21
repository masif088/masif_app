import { Card, CardBody, Col, Container, Row } from "reactstrap";
import Breadcrumbs from "CommonElements/Breadcrumbs";
import { CalenderHeading, AppsHeading } from "utils/Constant";
import DragCalendar from "@/components_source/app/calender/DragCalendar";

const Calender = () => {
  return (
    <div className="page-body">
      <Breadcrumbs
        title={CalenderHeading}
        mainTitle={CalenderHeading}
        parent={AppsHeading}
      />
      <Container fluid className="calendar-basic">
        <Row>
          <Col sm={12}>
            <Card className="calendar-default">
              <CardBody>
                <Row className="gap-xl-0 gap-3">
                  <DragCalendar />
                </Row>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Calender;
