import Breadcrumbs from "CommonElements/Breadcrumbs";
import { Col, Container, Row } from "reactstrap";
import { BlogHeading, BlogSingleHeading, ImgPath } from "utils/Constant";
import Image from "next/image";
import SingleBlogDetails from "@/components_source/Miscellaneous/Blog/SingleBlog/SingleBlogDetails";
import CommentSection from "@/components_source/Miscellaneous/Blog/SingleBlog/CommentSection";

const BlogSingle = () => {
  return (
    <div className="page-body">
      <Breadcrumbs title={BlogSingleHeading} mainTitle={BlogSingleHeading} parent={BlogHeading}/>
      <Container fluid={true} className="blog-list-items">
        <Row>
          <Col sm={12}>
            <div className="blog-single">
              <div className="blog-box blog-details">
                <Image width={1472} height={276} className="img-fluid w-100" src={`${ImgPath}/blog/blog-single.jpg`} alt="blog-main"/>
                <SingleBlogDetails />
              </div>
              <CommentSection />
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default BlogSingle;
