import LeftSideRibbons from '@/components_source/Bonus-Ui/Ribbons/LeftSideRibbons'
import RightSideRibbon from '@/components_source/Bonus-Ui/Ribbons/RightSideRibbon'
import Breadcrumbs from 'CommonElements/Breadcrumbs'
import React from 'react'
import { Container, Row } from 'reactstrap'

const Ribbons = () => {
    return (
        <div className='page-body'>
            <Breadcrumbs title='Ribbons' mainTitle='Ribbons' parent='Bonus Ui' />
            <Container fluid={true}>
                <Row>
                    <LeftSideRibbons />
                    <RightSideRibbon />
                </Row>
            </Container>
        </div>
    )
}

export default Ribbons