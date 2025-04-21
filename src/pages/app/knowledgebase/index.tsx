import { Col, Container, Row } from "reactstrap";
import Breadcrumbs from "CommonElements/Breadcrumbs";
import ArticeVideo from "@/components_source/Miscellaneous/faq/ArticeVideo";
import Articals from "@/components_source/Miscellaneous/Knowledgebase/Articals";
import CategoryData from "@/components_source/Miscellaneous/Knowledgebase/CategoryData";
import { FeaturedTutorials } from "utils/Constant";
import FeaturesTutorial from "@/components_source/Miscellaneous/Knowledgebase/FeaturesTutorial";
import KnowledgeBaseHelp from "@/components_source/Miscellaneous/Knowledgebase/KnowledgeBaseHelp";

const knowledgebase = () => {
  return (
    <div className="page-body">
      <Breadcrumbs title="Knowledgebase" mainTitle="Knowledgebase" parent="Knowledgebase"/>
      <Container fluid>
        <Row>
          <KnowledgeBaseHelp />
          <Articals />
          <CategoryData />
          <Col lg={12} className="featured-tutorial">
            <div className="header-faq">
              <h5 className="mb-0">{FeaturedTutorials}</h5>
            </div>
            <Row>
              <FeaturesTutorial />
            </Row>
          </Col>
          <ArticeVideo />
        </Row>
      </Container>
    </div>
  );
};

export default knowledgebase;
