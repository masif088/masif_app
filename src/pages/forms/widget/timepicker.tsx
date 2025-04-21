import Breadcrumbs from "CommonElements/Breadcrumbs";
import { Container, Row } from "reactstrap";
import { TimePickerHeading, FormWidgetsHeading } from "utils/Constant";

const TimePicker = () => {
  return (
    <div className="page-body">
      <Breadcrumbs
        mainTitle={TimePickerHeading}
        parent={FormWidgetsHeading}
        title={TimePickerHeading}
      />
      <Container fluid={true}>
        <Row></Row>
      </Container>
    </div>
  );
};

export default TimePicker;
