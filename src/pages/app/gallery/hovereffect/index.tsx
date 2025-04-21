import { Card, CardBody, Col, Container, Row } from "reactstrap";
import Breadcrumbs from "CommonElements/Breadcrumbs";
import { Gallery, Item } from "react-photoswipe-gallery";
import { Href, ImgPath } from "utils/Constant";
import Image from "next/image";
import CommonCardHeading from "CommonElements/CommonCardHeading";

const ImageHoverEffects = () => {
  let datas = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
  const imageList = [
    "lightgallry/08.jpg",
    "lightgallry/09.jpg",
    "lightgallry/010.jpg",
    "lightgallry/011.jpg",
  ];

  return (
    <div className="page-body">
      <Breadcrumbs
        title="Image Hover Effects"
        mainTitle="Image Hover Effects"
        parent="Gallery"
      />
      <Container fluid>
        {datas.map((data, index) => (
          <Row key={index}>
            <Col sm={12}>
              <Card>
                <CommonCardHeading smallHeading={`hove effect ${data}`} />
                <CardBody>
                  <Row className="my-gallery gallery">
                    <Gallery>
                      {imageList &&
                        imageList.map((item, i) => (
                          <figure
                            className={`col-md-3 col-6 img-hover hover-${data}`}
                            key={i}
                          >
                            <Item
                              original={`${ImgPath}/${item}`}
                              width="1024"
                              height="768"
                            >
                              {({ ref, open }) => (
                                <a href={Href} onClick={open}>
                                  <div>
                                    <Image
                                      width={364}
                                      height={241}
                                      className=""
                                      ref={
                                        ref as React.MutableRefObject<HTMLImageElement>
                                      }
                                      src={`${ImgPath}/${item}`}
                                      alt=""
                                    />
                                  </div>
                                </a>
                              )}
                            </Item>
                          </figure>
                        ))}
                    </Gallery>
                  </Row>
                </CardBody>
              </Card>
            </Col>
          </Row>
        ))}
      </Container>
    </div>
  );
};

export default ImageHoverEffects;
