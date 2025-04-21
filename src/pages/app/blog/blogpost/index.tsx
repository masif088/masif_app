import Breadcrumbs from "CommonElements/Breadcrumbs";
import { Card, CardBody, Col, Container, Row, Button } from "reactstrap";
import { BlogHeading, BlogPostHeading, Discard, Post } from "utils/Constant";
import dynamic from "next/dynamic";

const BlogPost = () => {
  const FormPost = dynamic(() => import("@/components_source/Miscellaneous/Blog/BlogPost/FormPost"),{ ssr: false });
  const DropzoneClass = dynamic(() => import("@/components_source/Miscellaneous/Blog/BlogPost/DropzoneClass"),{ ssr: false });

  return (
    <div className="page-body">
      <Breadcrumbs title={BlogPostHeading} mainTitle={BlogPostHeading} parent={BlogHeading} />
      <Container fluid={true}>
        <Row>
          <Col sm={12}>
            <Card>
              <CardBody className="add-post">
                <FormPost />
                <DropzoneClass />
                <div className="btn-showcase text-end">
                  <Button color="primary" type="submit">{Post}</Button>
                  <Button color="light" type="reset">{Discard}</Button>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default BlogPost;
