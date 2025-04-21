import BadgeButton from '@/components_source/Ui-kits/TagPills/BadgeButton'
import BadgeHeading from '@/components_source/Ui-kits/TagPills/BadgeHeading'
import BadgeWithIcon from '@/components_source/Ui-kits/TagPills/BadgeWithicon'
import Badges from '@/components_source/Ui-kits/TagPills/Badges'
import NumberBadges from '@/components_source/Ui-kits/TagPills/NumberBages'
import NumberPills from '@/components_source/Ui-kits/TagPills/NumberPills'
import PillsContextual from '@/components_source/Ui-kits/TagPills/PillsContextual'
import RoundedPillicon from '@/components_source/Ui-kits/TagPills/RoundedPillIcon'
import Breadcrumbs from 'CommonElements/Breadcrumbs'
import React from 'react'
import { Container, Row } from 'reactstrap'

const TagandPills = () => {
    return (
        <div className='page-body'>
            <Breadcrumbs mainTitle='Tag & Pills' title='Tag & Pills' parent='Ui Kits' />
            <Container fluid={true}>
                <Row>
                    <Badges />
                    <PillsContextual />
                    <NumberBadges />
                    <NumberPills />
                    <BadgeWithIcon />
                    <RoundedPillicon />
                    <BadgeHeading />
                    <BadgeButton />
                </Row>
            </Container>
        </div>
    )
}

export default TagandPills