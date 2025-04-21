import React, { useCallback, useState } from "react";
import Breadcrumbs from "../../../../CommonElements/Breadcrumbs";
import { Container, Row } from "reactstrap";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import IconMarkUp from "@/components_source/Icons/IconMarkUp";
import IcoIconCommon from "@/components_source/Icons/IcoIconCommon";

const IcoIcon = ({
  iconData,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const iconList = iconData;
  const [iTag, setiTag] = useState<{ iTag: string }>({ iTag: "" });
  const [icon, setIcon] = useState<{ icon: string }>({ icon: "" });

  const callback = useCallback((tag: string) => {
    setiTag({
      iTag: '<i className="icofont icofont-' + tag + '"></i>',
    });
    setIcon({
      icon: "icofont icofont-" + tag + " fa-2x",
    });
  }, []);

  return (
    <div className="page-body">
      <Breadcrumbs title="ICO Icon" mainTitle="ICO Icon" parent="Icon" />
      <Container fluid={true}>
        <Row>
          {iconList &&
            iconList.map((item, index) => (
              <IcoIconCommon
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

export default IcoIcon;

type Data = {
  title: string;
  icons: string[];
};

export const getServerSideProps: GetServerSideProps<{
  iconData: Data[];
}> = async () => {
  const res = await fetch(process.env.API_URL + "/iconapi/icoiconlist");
  const iconData = await res.json();
  return {
    props: {
      iconData,
    },
  };
};
