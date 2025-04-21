import Basicpopover from '@/components_source/Ui-kits/Popover/Basicpopover'
import OffsetPopover from '@/components_source/Ui-kits/Popover/OffsetPopover'
import PopoverDirection from '@/components_source/Ui-kits/Popover/PopoverDirection'
import Breadcrumbs from 'CommonElements/Breadcrumbs'
import React from 'react'
import { Container, Row } from 'reactstrap'

const Popover = () => {
    return (
        <div className='page-body'>
            <Breadcrumbs title='Popover' mainTitle='Popover' parent='Ui Kits' />
            <Container fluid={true}>
                <Row className='popover-main'>
                    <Basicpopover />
                    <PopoverDirection />
                    <OffsetPopover />
                </Row>
            </Container>
        </div>
    )
}

export default Popover