import { useCallback } from 'react';
import { useIntl } from 'react-intl';
import { useNavigate, useOutletContext } from 'react-router';
import { NavLink } from 'react-router-dom';
import styled from '@emotion/styled';

import { useVideoInfo } from '../contexts/VideoInfo.jsx';

const H1 = styled.h1`
    font-size: 50px;
`;

const Item = styled.div`
    font-size: 20px;
    border-radius: 10px;
    margin: 5px;
    padding: 10px;
    width: 80%;
    max-width: 640px;
    background-color: white;
`;

const CreateItem = styled(Item)`width: auto; display: inline-block`;

const LangButton = styled.button`
    background: transparent;
    font-size: 20px;
    border: none;
    text-decoration: underline;
    cursor: pointer;
    margin-left: 5px;
`;

function HomePage({ setLocale }) {
    const intl = useIntl();
    const [downloadedList] = useVideoInfo();
    const navigate = useNavigate();
    const handleCreateVideo = useCallback(async (event) => {
        event.preventDefault();

        if (Notification.permission !== 'denied') {
            await Notification.requestPermission();
        }

        navigate('/create');
    }, []);

    return (
        <div>
            <H1>{intl.formatMessage({ id: 'homePage.title' })}</H1>
            {downloadedList && <CreateItem key="create">
                <NavLink
                    to="/create"
                    onClick={handleCreateVideo}
                >
                    {intl.formatMessage({ id: 'homePage.createButton.text' })}
                </NavLink>
            </CreateItem>}
            {downloadedList?.map(({ url, createdAt, name }) => (
                <Item key={url}>
                <NavLink to={`/watch/${encodeURIComponent(createdAt)}`}>
                {name}
                </NavLink>
                </Item>
            ))}
            <div>
                <LangButton onClick={() => { setLocale('en'); }}>EN</LangButton>
                <LangButton onClick={() => { setLocale('zh'); }}>中</LangButton>
            </div>
        </div>
    );
}

export default HomePage;
