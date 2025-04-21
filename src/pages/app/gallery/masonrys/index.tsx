import Breadcrumbs from "CommonElements/Breadcrumbs";
import CommonCardHeading from "CommonElements/CommonCardHeading";
import { masonryImageData } from "Data/gallery";
import Image from "next/image";
import Link from "next/link";
import Masonry from "react-masonry-css";
import { Gallery, Item } from "react-photoswipe-gallery";
import { Card, CardBody, Col, Container, Row } from "reactstrap";
import { Href, ImgPath, MasonryGalleryHeading } from "utils/Constant";

const MasonryGallery = () => {
  const breakpointColumnsObj = {
    default: 4,
    1199: 3,
    700: 2,
    500: 1,
  };
  return (
    <div className="page-body">
      <Breadcrumbs
        title="Masonry Gallery"
        mainTitle="Masonry Gallery"
        parent="Gallery"
      />
      <Container fluid={true}>
        <Row>
          <Col sm={12}>
            <Card>
              <CommonCardHeading smallHeading={MasonryGalleryHeading} />
              <CardBody className="photoswipe-pb-responsive">
                <Gallery>
                  <Masonry
                    breakpointCols={breakpointColumnsObj}
                    className="my-gallery row grid gallery"
                    columnClassName="col-md-3 col-sm-6 grid-item"
                  >
                    {masonryImageData.map((element, index) => (
                      <figure key={index} className="m-0">
                        <Item
                          original={`${ImgPath}/${element.src}`}
                          width="1300"
                          height="750"
                        >
                          {({ ref, open }) => (
                            <Link href={Href} onClick={open}>
                              <img
                                className="img-thumbnail mb-4"
                                ref={
                                  ref as React.MutableRefObject<HTMLImageElement>
                                }
                                src={`${ImgPath}/${element.src}`}
                                alt="images"
                              />
                            </Link>
                          )}
                        </Item>
                      </figure>
                    ))}
                  </Masonry>
                </Gallery>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default MasonryGallery;
