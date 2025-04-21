import DatePickerComponent from "@/components_source/Forms/Widget/DatePicker/DatePickerComponent";
import DefaultCalendar from "@/components_source/Forms/Widget/DatePicker/DefaultCalendar";
import ReactStrapCalendar from "@/components_source/Forms/Widget/DatePicker/ReactstrapCalendar";
import TimePicker from "@/components_source/Forms/Widget/DatePicker/TimePicker";
import Breadcrumbs from "CommonElements/Breadcrumbs";
import { Container, Row } from "reactstrap";
import { DatePickerHeading, FormWidgetsHeading } from "utils/Constant";

const DatePicker = () => {
  return (
    <div className="page-body">
      <Breadcrumbs
        mainTitle={DatePickerHeading}
        parent={FormWidgetsHeading}
        title={DatePickerHeading}
      />
      <Container fluid={true}>
        <Row>
          <DefaultCalendar />
          <ReactStrapCalendar />
          <DatePickerComponent />
          <TimePicker />
        </Row>
      </Container>
    </div>
  );
};

export default DatePicker;
