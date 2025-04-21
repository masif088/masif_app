import React, { useCallback, useState } from "react";
import Breadcrumbs from "../../../../CommonElements/Breadcrumbs";
import { Container, Row } from "reactstrap";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import IconMarkUp from "@/components_source/Icons/IconMarkUp";
import ThemifyCommon from "@/components_source/Icons/ThemifyCommon";

const ThemifyIcons = ({
  iconData,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const iconList = iconData;
  const [iTag, setiTag] = useState<{ iTag: string }>({ iTag: "" });
  const [icon, setIcon] = useState<{ icon: string }>({ icon: "" });

  const callback = useCallback((tag: string) => {
    setiTag({
      iTag: '<i className= "' + tag + '"></i>',
    });
    setIcon({
      icon: "" + tag + " fa-2x",
    });
  }, []);

  return (
    <div className="page-body">
      <Breadcrumbs
        title="Themify icon"
        mainTitle="Themify icon"
        parent="Icons"
      />
      <Container fluid={true}>
        <Row>
          {iconList &&
            iconList.map((item, index) => (
              <ThemifyCommon
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

export default ThemifyIcons;

type Data = {
  title: string;
  icons: string[];
};

export const getServerSideProps: GetServerSideProps<{
  iconData: Data[];
}> = async () => {
  const res = await fetch(process.env.API_URL + "/iconapi/themifyiconlist");
  const iconData = await res.json();
  return {
    props: {
      iconData,
    },
  };
};
