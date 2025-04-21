import Breadcrumbs from "CommonElements/Breadcrumbs";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import React, { useCallback, useState } from "react";
import { Container, Row } from "reactstrap";
import IconMarkUp from "@/components_source/Icons/IconMarkUp";
import FlagCommon from "@/components_source/Icons/FlagCommon";

const FlagIcons = ({
  iconData,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const IconList = iconData;
  const [iTag, setITag] = useState<{ iTag: string }>({ iTag: "" });
  const [icon, setIcon] = useState<{ icon: string }>({ icon: "" });

  const CallBack = useCallback((tag: string) => {
    setITag({
      iTag: '<i className="flag-icon flag-icon-' + tag + '"></i>',
    });
    setIcon({
      icon: "flag-icon flag-icon-" + tag + " fa-2x",
    });
  }, []);
  return (
    <div className="page-body">
      <Breadcrumbs title="Flag Icons" mainTitle="Flag Icons" parent="Icons" />
      <Container fluid={true}>
        <Row>
          <FlagCommon callBack={CallBack} iconData={IconList} />
        </Row>
      </Container>
      <IconMarkUp itag={iTag} icon={icon} />
    </div>
  );
};

export default FlagIcons;

type Data = {
  abbrivation: string;
  name: string;
};

export const getServerSideProps: GetServerSideProps<{
  iconData: Data[];
}> = async () => {
  const res = await fetch(process.env.API_URL + "/iconapi/flagiconlist");
  const iconData = await res.json();
  return {
    props: {
      iconData,
    },
  };
};
