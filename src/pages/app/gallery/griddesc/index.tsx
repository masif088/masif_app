import { Card, CardBody, Col, Container, Row } from "reactstrap";
import Breadcrumbs from "CommonElements/Breadcrumbs";
import GalleryImageDescription from "@/components_source/Miscellaneous/gallery/GalleryGridWithDescription/GalleryImageDescription";
import { GalleryGridWithDescriptionHeading, GalleryHeading } from "utils/Constant";
import CommonCardHeading from "CommonElements/CommonCardHeading";

const GalleryGridWithDescription = () => {
  return (
    <div className="page-body">
      <Breadcrumbs title={GalleryGridWithDescriptionHeading} mainTitle={GalleryGridWithDescriptionHeading} parent={GalleryHeading}/>
      <Container fluid={true}>
        <Row>
          <Col sm={12}>
            <Card>
              <CommonCardHeading smallHeading={GalleryGridWithDescriptionHeading}/>
              <CardBody className="my-gallery row gallery-with-description">
                <GalleryImageDescription />
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default GalleryGridWithDescription;
