import Breadcrumbs from "CommonElements/Breadcrumbs";
import dynamic from "next/dynamic";
import { Container } from "reactstrap";
import { ChartJsHeading, Chart } from "utils/Constant";

const ChartJS = () => {
  const ChartJsContainer = dynamic(() => import("@/components_source/Charts/ChartJS"),{ ssr: false });

  return (
    <div className="page-body">
      <Breadcrumbs
        mainTitle={ChartJsHeading}
        parent={Chart}
        title={ChartJsHeading}
      />
      <Container fluid={true}>
        <ChartJsContainer />
      </Container>
    </div>
  );
};

export default ChartJS;
