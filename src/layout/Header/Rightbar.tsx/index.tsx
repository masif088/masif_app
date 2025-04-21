import React from 'react'
import { Col } from 'reactstrap'
import Language from './Languages/index.tsx';
import Searchbar from './Searchbar';
import BookmarkHeader from './BookmarkHeader';
import MoonLight from './MoonLight';
import CartHeader from './CartHeader';
import Notificationbar from './Notificationbar';
import Profile from './Profile';

const Rightbar = () => {
    return (
        <Col xxl={7} xl={6} md={7} xs={8} className='nav-right pull-right right-header p-0 ms-auto'>
            <ul className='nav-menus flex-row'>
                <Language />
                <Searchbar />
                <BookmarkHeader />
                <MoonLight />
                <CartHeader />
                <Notificationbar />
                <Profile />
            </ul>
        </Col>
    )
}

export default Rightbar