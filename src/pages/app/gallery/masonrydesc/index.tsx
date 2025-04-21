import Breadcrumbs from "CommonElements/Breadcrumbs";
import CommonCardHeading from "CommonElements/CommonCardHeading";
import { masonryImageData } from "Data/gallery";
import Link from "next/link";
import Masonry from "react-masonry-css";
import { Gallery, Item } from "react-photoswipe-gallery";
import { Card, CardBody, Col, Container, Row } from "reactstrap";
import { Href, IMAGEGALLERY, ImgPath, PortfolioTitle } from "utils/Constant";

const MasonryGalleryWithDescription = () => {
  const breakpointColumnsObj = { default: 4, 1199: 3, 700: 2, 500: 1 };
  return (
    <div className="page-body">
      <Breadcrumbs
        title="Masonry Gallery With Description"
        mainTitle="Masonry Gallery With Description"
        parent="Gallery"
      />
      <Container fluid={true}>
        <Row>
          <Col sm={12}>
            <Card>
              <CommonCardHeading smallHeading={IMAGEGALLERY} />
              <CardBody className="photoswipe-pb-responsive">
                <Gallery>
                  <Masonry
                    breakpointCols={breakpointColumnsObj}
                    className="my-gallery row grid gallery-with-description"
                    columnClassName="grid-item col-xl-3 col-sm-6"
                  >
                    {masonryImageData.map((element, index) => (
                      <li
                        style={{ listStyle: "none" }}
                        key={index}
                        className="p-0"
                      >
                        <figure className="m-0">
                          <Item
                            original={`${ImgPath}/${element.src}`}
                            width="1300"
                            height="750"
                          >
                            {({ ref, open }) => (
                              <Link href={Href} onClick={open}>
                                <img
                                  className="img-thumbnail p-2 border border-1 border-bottom-0 rounded-0 rounded-top-1"
                                  ref={
                                    ref as React.MutableRefObject<HTMLImageElement>
                                  }
                                  src={`${ImgPath}/${element.src}`}
                                  alt="images"
                                />
                                <div className="caption border-top-0 p-2">
                                  <h4 className="mt-0">{PortfolioTitle}</h4>
                                  <p>{`is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy.`}</p>
                                </div>
                              </Link>
                            )}
                          </Item>
                        </figure>
                      </li>
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

export default MasonryGalleryWithDescription;
