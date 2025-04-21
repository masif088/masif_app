import Breadcrumbs from "CommonElements/Breadcrumbs";
import { Container, Row } from "reactstrap";
import { DateTimePickerHeading, FormWidgetsHeading } from "utils/Constant";

const DateTimePicker = () => {
  return (
    <div className="page-body">
      <Breadcrumbs
        mainTitle={DateTimePickerHeading}
        parent={FormWidgetsHeading}
        title={DateTimePickerHeading}
      />
      <Container fluid={true}>
        <Row></Row>
      </Container>
    </div>
  );
};

export default DateTimePicker;
