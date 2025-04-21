import CollapesAccordion from '@/components_source/Ui-kits/Accordion/CollapesAccordion'
import FlushAccordion from '@/components_source/Ui-kits/Accordion/FlushAccordion'
import HorizontalAccordion from '@/components_source/Ui-kits/Accordion/HorizontalAccordion'
import IconAccordion from '@/components_source/Ui-kits/Accordion/IconAccordion'
import MultipleCollapes from '@/components_source/Ui-kits/Accordion/MultipleCollaps'
import OutlineAccordion from '@/components_source/Ui-kits/Accordion/OutlineAccordion'
import SimpleAccordion from '@/components_source/Ui-kits/Accordion/SimpleAccordion'
import Breadcrumbs from 'CommonElements/Breadcrumbs'
import React from 'react'
import { Container, Row } from 'reactstrap'

const Accordion = () => {
    return (
        <div className='page-body'>
            <Breadcrumbs title='Accordion' mainTitle='Accordion' parent='Ui Kits' />
            <Container fluid={true}>
                <Row>
                    <SimpleAccordion />
                    <FlushAccordion />
                    <MultipleCollapes />
                    <IconAccordion />
                    <OutlineAccordion />
                    <HorizontalAccordion />
                    <CollapesAccordion />
                </Row>
            </Container>
        </div>
    )
}

export default Accordion