import Breadcrumbs from "CommonElements/Breadcrumbs";
import { userContact } from "Types/ContactType";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import React, { useEffect } from "react";
import { useContext } from "react";
import { ContactContext } from "../../../../helper/Contacts/index";
import { Container, Row } from "reactstrap";
import LeftSide from "@/components_source/app/Contacts/LeftSide";
import { Apps, ContactHeading } from "utils/Constant";

const Contact = ({
  user,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const { setUsers } = useContext(ContactContext);
  useEffect(() => {
    setUsers(user);
  }, []);

  return (
    <div className="page-body">
      <Breadcrumbs
        title={ContactHeading}
        mainTitle={ContactHeading}
        parent={Apps}
      />
      <Container fluid={true}>
        <div className="email-wrap bookmark-wrap contacts-items">
          <Row>
            <LeftSide />
          </Row>
        </div>
      </Container>
    </div>
  );
};

export default Contact;

export const getServerSideProps: GetServerSideProps<{
  user: userContact[];
}> = async () => {
  const res = await fetch(process.env.API_URL + "/contact");
  const user = await res.json();
  return {
    props: {
      user,
    },
  };
};
