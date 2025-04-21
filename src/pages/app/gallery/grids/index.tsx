import { Card, CardBody, Col, Container, Row } from "reactstrap";
import Breadcrumbs from "CommonElements/Breadcrumbs";
import GalleryImages from "@/components_source/Miscellaneous/gallery/GalleryGrid/GalleryImages";
import CommonCardHeading from "CommonElements/CommonCardHeading";
import { GalleryHeading, IMAGEGALLERY } from "utils/Constant";

const GalleryGrid = () => {
  return (
    <div className="page-body">
      <Breadcrumbs title={GalleryHeading} mainTitle={GalleryHeading} parent={GalleryHeading} />
      <Container fluid={true}>
        <Row>
          <Col sm={12}>
            <Card>
              <CommonCardHeading smallHeading={IMAGEGALLERY} />
              <CardBody className="gallery my-gallery row">
                <GalleryImages />
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default GalleryGrid;
