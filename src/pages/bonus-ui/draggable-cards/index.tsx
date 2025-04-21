import Breadcrumbs from 'CommonElements/Breadcrumbs'
import React from 'react'
import { Container, Row } from 'reactstrap'

const DragableCards = () => {
    return (
        <div className='page-body'>
            <Breadcrumbs title='Draggable Card' mainTitle='Draggable Card' parent='Bonus Ui' />
            <Container fluid={true}>
                <Row className='ui-sortable'>

                </Row>
            </Container>
        </div>
    )
}

export default DragableCards