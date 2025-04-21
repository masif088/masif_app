import React from 'react'
import { Container, Row } from 'reactstrap'
import BreadCrumbs from '../../../../CommonElements/Breadcrumbs'
import Basicrange from '@/components_source/Bonus-Ui/RangeSlider/BasicRange'
import NagativeValue from '@/components_source/Bonus-Ui/RangeSlider/Nagativevalue'
import DisabledClass from '@/components_source/Bonus-Ui/RangeSlider/DisabledClass'
import FormateRange from '@/components_source/Bonus-Ui/RangeSlider/FormateRange'
import FormateLabel from '@/components_source/Bonus-Ui/RangeSlider/FormateLabel'
import Draggable from '@/components_source/Bonus-Ui/RangeSlider/Draggable'

const RangeSlider = () => {
    return (
        <div className='page-body'>
            <BreadCrumbs title='Range Slider' mainTitle='Range Slider' parent='Bonus Ui' />
            <Container fluid={true}>
                <Row>
                    <Basicrange />
                    <NagativeValue />
                    <DisabledClass />
                    <FormateRange />
                    <FormateLabel />
                    <Draggable />
                </Row>
            </Container>
        </div>
    )
}

export default RangeSlider