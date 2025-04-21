
import Breadcrumbs from "CommonElements/Breadcrumbs";
import dynamic from "next/dynamic";
import { Container, Row } from "reactstrap";
import { ApexChartHeading, Chart } from "utils/Constant";

const apexCharts = () => {
const ApexChartContainer = dynamic(() => import('@/components_source/Charts/ApexChart'), { ssr: false });

  return (
    <div className="page-body">
      <Breadcrumbs
        mainTitle={ApexChartHeading}
        parent={Chart}
        title={ApexChartHeading}
      />
      <Container fluid={true}>
        <ApexChartContainer/>
      </Container>
    </div>
  );
};

export default apexCharts;
