import React, { SetStateAction, useCallback, useState } from "react";
import Breadcrumbs from "../../../../CommonElements/Breadcrumbs";
import FontAwsomeicon from "@/components_source/Icons/FontAwsomeIcon";
import { Container, Row } from "reactstrap";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import IconMarkUp from "@/components_source/Icons/IconMarkUp";

const FontawesomeIcon = ({
  iconData,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const iconList = iconData;
  const [iTag, setiTag] = useState<{ iTag: string }>({ iTag: "" });
  const [icon, setIcon] = useState<{ icon: string }>({ icon: "" });

  const callback = useCallback((tag: string) => {
    setiTag({
      iTag: '<i className="fa fa-' + tag + '"></i>',
    });
    setIcon({
      icon: "fa fa-" + tag + " fa-2x",
    });
  }, []);

  return (
    <div className="page-body">
      <Breadcrumbs
        title="Font Awesome Icon"
        mainTitle="Font Awesome Icon"
        parent="Icons"
      />
      <Container fluid={true}>
        <Row>
          {iconList &&
            iconList.map((item, index) => (
              <FontAwsomeicon
                iconType={item}
                parentCallback={callback}
                key={index}
              />
            ))}
        </Row>
      </Container>
      <IconMarkUp itag={iTag} icon={icon} />
    </div>
  );
};

export default FontawesomeIcon;

type Data = {
  title: string;
  icons: string[];
};

export const getServerSideProps: GetServerSideProps<{
  iconData: Data[];
}> = async () => {
  const res = await fetch(process.env.API_URL + "/iconapi/fontawsomelist");
  const iconData = await res.json();
  return {
    props: {
      iconData,
    },
  };
};
