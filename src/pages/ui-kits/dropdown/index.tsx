import BasicDropdown from '@/components_source/Ui-kits/Dropdown/BasicDropdown'
import RoundedDropdown from '@/components_source/Ui-kits/Dropdown/RoundedDropdown'
import SplitDropdown from '@/components_source/Ui-kits/Dropdown/SplitDropdown';
import HeadingDropdown from '@/components_source/Ui-kits/Dropdown/HeadingDropdown';
import Breadcrumbs from 'CommonElements/Breadcrumbs'
import React from 'react'
import { Container, Row } from 'reactstrap'
import DropdownwithInput from '@/components_source/Ui-kits/Dropdown/DropdownwithInput';
import DarkDropdown from '@/components_source/Ui-kits/Dropdown/DarkDropDown';
import UniqeDropdown from '@/components_source/Ui-kits/Dropdown/UniqeDropdown';
import JustifyContent from '@/components_source/Ui-kits/Dropdown/JustifyContent';
import Alignment from '@/components_source/Ui-kits/Dropdown/Alignment';
import HelperCard from '@/components_source/Ui-kits/Dropdown/HelperCard';
import DividerDropdown from '@/components_source/Ui-kits/Dropdown/DividerDropdown';
import DropdownSize from '@/components_source/Ui-kits/Dropdown/DropdownSize';

const Dropdown = () => {
    return (
        <div className='page-body'>
            <Breadcrumbs title='Dropdown' mainTitle='Dropdown' parent='Ui Kits' />
            <Container fluid={true}>
                <Row>
                    <BasicDropdown />
                    <RoundedDropdown />
                    <SplitDropdown />
                    <HeadingDropdown />
                    <DropdownwithInput />
                    <DarkDropdown />
                    <UniqeDropdown />
                    <JustifyContent />
                    <Alignment />
                    <HelperCard />
                    <DividerDropdown />
                    <DropdownSize />
                </Row>
            </Container>
        </div>
    )
}

export default Dropdown