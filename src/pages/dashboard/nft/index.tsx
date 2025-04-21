import Breadcrumbs from "CommonElements/Breadcrumbs";
import { Container, Row } from "reactstrap";
import { Dashboard, NFTDashboard } from "utils/Constant";
import TrendingCreatorCard from "@/components_source/Dashboard/NFT/TrendingCreatorCard";
import ExploreNftCard from "@/components_source/Dashboard/NFT/ExploreNftCard";
import NftBalanceCard from "@/components_source/Dashboard/NFT/NftBalanceCard";
import TrendingAction from "@/components_source/Dashboard/NFT/TrendingAction";
import dynamic from 'next/dynamic';

const NFT = () => {
const IncomeAndSaleStatus = dynamic(() => import('@/components_source/Dashboard/NFT/IncomeAndSaleStatus'), { ssr: false });
const EthReportCard = dynamic(() => import('@/components_source/Dashboard/NFT/EthReportCard'), { ssr: false });
const NftDetails = dynamic(() => import('@/components_source/Dashboard/NFT/NftDetails'), { ssr: false });

  return (
    <div className="page-body">
      <Breadcrumbs
        title={NFTDashboard}
        mainTitle={NFTDashboard}
        parent={Dashboard}
      />
      <Container fluid={true}>
        <Row>
          <TrendingCreatorCard />
          <ExploreNftCard />
          <NftBalanceCard />
          <IncomeAndSaleStatus />
          <TrendingAction/>
          <EthReportCard/>
          <NftDetails/>
        </Row>
      </Container>
    </div>
  );
};

export default NFT;
