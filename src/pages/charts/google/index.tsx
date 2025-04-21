import Breadcrumbs from "CommonElements/Breadcrumbs";
import dynamic from "next/dynamic";
import { Container } from "reactstrap";
import { GoogleChartHeading, Chart } from "utils/Constant";

const GoogleChart = () => {
  const GoogleChartContainer = dynamic(() => import("@/components_source/Charts/GoogleChart"),{ ssr: false });

  return (
    <div className="page-body">
      <Breadcrumbs
        mainTitle={GoogleChartHeading}
        parent={Chart}
        title={GoogleChartHeading}
      />
      <Container fluid={true}>
        <GoogleChartContainer />
      </Container>
    </div>
  );
};

export default GoogleChart;
