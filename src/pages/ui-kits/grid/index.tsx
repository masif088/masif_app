import GridColumn from '@/components_source/Ui-kits/Grid/GridColumn'
import GridOptions from '@/components_source/Ui-kits/Grid/GridOption'
import HorizontalAlignment from '@/components_source/Ui-kits/Grid/HorizontalAlignment'
import Nesting from '@/components_source/Ui-kits/Grid/Nesting'
import Offset from '@/components_source/Ui-kits/Grid/Offset'
import Order from '@/components_source/Ui-kits/Grid/Order'
import VerticalAlignment from '@/components_source/Ui-kits/Grid/VerticalAlignment'
import Breadcrumbs from 'CommonElements/Breadcrumbs'
import React from 'react'
import { Container, Row } from 'reactstrap'

const Grid = () => {
    return (
        <div className='page-body'>
            <Breadcrumbs mainTitle='Grid' title='Grid' parent='Ui Kits' />
            <Container fluid={true}>
                <Row>
                    <GridOptions />
                    <GridColumn />
                    <VerticalAlignment />
                    <HorizontalAlignment />
                    <Nesting />
                    <Order />
                    <Offset />
                </Row>
            </Container>
        </div>
    )
}

export default Grid