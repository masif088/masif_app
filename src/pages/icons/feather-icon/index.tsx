import React, { useCallback, useState } from "react";
import Breadcrumbs from "../../../../CommonElements/Breadcrumbs";
import { Container, Row } from "reactstrap";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import FeatherCommon from "@/components_source/Icons/FeatherCommon";
import IconMarkUp from "@/components_source/Icons/IconMarkUp";

const FeatherIcon = ({
  iconData,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const dataList = iconData[0].feather_icons;
  const [iTag, setITag] = useState<{ iTag: string }>({ iTag: "" });
  const [icon, setIcon] = useState<{ feathericon: string }>({
    feathericon: "",
  });

  const callBack = useCallback((tag: string) => {
    setITag({
      iTag: '<i data-feather="' + tag + '"></i>',
    });
    setIcon({
      feathericon: tag,
    });
  }, []);
  return (
    <div className="page-body">
      <Breadcrumbs
        title="Feather Icons"
        mainTitle="Feather Icons"
        parent="Icons"
      />
      <Container fluid={true}>
        <Row>
          <FeatherCommon iconType={dataList} parentCallback={callBack} />
        </Row>
      </Container>
      <IconMarkUp itag={iTag} icon={icon} />
    </div>
  );
};

export default FeatherIcon;

type DataType = {
  feather_icons: string[];
};

export const getServerSideProps: GetServerSideProps<{
  iconData: DataType[];
}> = async () => {
  const res = await fetch(process.env.API_URL + "/iconapi/featherlist");
  const iconData = await res.json();
  return {
    props: {
      iconData,
    },
  };
};
