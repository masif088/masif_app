import React from 'react';
import Breadcrumbs from '../../../../CommonElements/Breadcrumbs';
import { Container, Row } from 'reactstrap';
import WeatherCommon from '@/components_source/Icons/WeatherCommon';

const WeatherIcon = () => {
    return (
        <div className='page-body'>
            <Breadcrumbs title='Whether Icon' mainTitle='Whether Icon' parent='Icons' />
            <Container fluid={true}>
                <Row>
                    <WeatherCommon />
                </Row>
            </Container>
        </div>
    )
}

export default WeatherIcon