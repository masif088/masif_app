import ActiveList from "@/components_source/Ui-kits/Lists/ActiveList";
import BadgeList from "@/components_source/Ui-kits/Lists/BadgeList";
import ContextualClass from "@/components_source/Ui-kits/Lists/ContextualClass";
import CustomList from "@/components_source/Ui-kits/Lists/CustomList";
import DefaultList from "@/components_source/Ui-kits/Lists/DefaultList";
import DisableList from "@/components_source/Ui-kits/Lists/DisableList";
import FlushList from "@/components_source/Ui-kits/Lists/FlushList";
import HorizontalList from "@/components_source/Ui-kits/Lists/HorizontalList";
import JsBehavior from "@/components_source/Ui-kits/Lists/JsBehaviorList";
import ListWithCheckbox from "@/components_source/Ui-kits/Lists/ListWithCheckbox";
import ListNumber from "@/components_source/Ui-kits/Lists/Listnumber";
import RadioList from "@/components_source/Ui-kits/Lists/RadioList";
import ScrollableList from "@/components_source/Ui-kits/Lists/ScrollableList";
import Breadcrumbs from "CommonElements/Breadcrumbs";
import React from "react";
import { Container, Row } from "reactstrap";

const List = () => {
  return (
    <div className="page-body">
      <Breadcrumbs title="Lists" mainTitle="Lists" parent="Ui Kits" />
      <Container fluid={true}>
        <Row>
          <DefaultList />
          <ActiveList />
          <FlushList />
          <ContextualClass />
          <HorizontalList />
          <CustomList />
          <ListWithCheckbox />
          <RadioList />
          <ListNumber />
          <JsBehavior />
          <BadgeList />
          <DisableList />
          <ScrollableList />
        </Row>
      </Container>
    </div>
  );
};

export default List;
