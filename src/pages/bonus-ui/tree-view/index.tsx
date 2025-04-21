import Breadcrumbs from 'CommonElements/Breadcrumbs'
import React from 'react'
import { Container, Row } from 'reactstrap'
import BasicTree from '@/components_source/Bonus-Ui/TreeView/BasicTree';
import DisabledTree from '@/components_source/Bonus-Ui/TreeView/DisabledTree'

const TreeView = () => {
    return (
        <div className='page-body'>
            <Breadcrumbs title='Tree View' mainTitle='Tree View' parent='Bonus Ui' />
            <Container fluid={true}>
                <Row>
                    <BasicTree />
                    <DisabledTree />
                </Row>
            </Container>
        </div>
    )
}

export default TreeView