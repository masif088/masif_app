import AvatarGroup from '@/components_source/Ui-kits/Avatars/GroupAvatar'
import AvatarRatio from '@/components_source/Ui-kits/Avatars/Ratio'
import AvatarShapes from '@/components_source/Ui-kits/Avatars/Shapes'
import AvatarSize from '@/components_source/Ui-kits/Avatars/Size'
import AvatarStatus from '@/components_source/Ui-kits/Avatars/Status'
import Breadcrumbs from 'CommonElements/Breadcrumbs'
import React from 'react'
import { Container, Row } from 'reactstrap'

const Avatar = () => {
    return (
        <div className='page-body'>
            <Breadcrumbs title='Avatars' mainTitle='Avatars' parent="Ui Kits" />
            <Container fluid={true}>
                <div className='user-profile'>
                    <Row>
                        <AvatarSize />
                        <AvatarStatus />
                        <AvatarShapes />
                        <AvatarRatio />
                        <AvatarGroup />
                    </Row>
                </div>
            </Container>
        </div>
    )
}

export default Avatar