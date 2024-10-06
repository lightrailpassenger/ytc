import { useCallback, useState } from 'react';
import { useIntl } from 'react-intl';
import { useNavigate } from 'react-router';
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

const SmallItem = styled(Item)`
    width: auto;
    cursor: pointer;
    display: inline-block;
`;

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
    const [downloadedList, setDownloadedList] = useVideoInfo();
    const navigate = useNavigate();
    const handleCreateVideo = useCallback(async (event) => {
        event.preventDefault();

        if (Notification.permission !== 'denied') {
            await Notification.requestPermission();
        }

        navigate('/create');
    }, [navigate]);

    const [cleanedVideoCount, setCleanedVideoCount] = useState(null);
    const handleCleanVideos = useCallback(async () => {
        try {
            const res = await fetch('http://localhost:9000/garbage-videos', { method: 'delete' });
            const { count } = await res.json();

            setCleanedVideoCount(count);

            const refetchRes = await fetch('http://localhost:9000/downloaded-videos');

            if (refetchRes.ok) {
                const { videos } = await refetchRes.json();

                setDownloadedList(videos);
            }
        } catch {
            setCleanedVideoCount(null);
        }
    }, []);

    return (
        <div>
            <H1>{intl.formatMessage({ id: 'homePage.title' })}</H1>
            <dialog open={typeof cleanedVideoCount === 'number'} onClose={() => { setCleanedVideoCount(null); }}>
                <form method="dialog">
                    <p>
                        {intl.formatMessage({ id: 'homePage.cleanup.done' }, { count: cleanedVideoCount })}
                    </p>
                    <input type="submit" value={intl.formatMessage({ id: 'homePage.cleanup.close' })} />
                </form>
            </dialog>
            {downloadedList && (
                <>
                    <SmallItem key="create">
                        <NavLink
                            to="/create"
                            onClick={handleCreateVideo}
                        >
                            {intl.formatMessage({ id: 'homePage.createButton.text' })}
                        </NavLink>
                    </SmallItem>
                    <SmallItem key="clean" onClick={handleCleanVideos}>
                        {intl.formatMessage({ id: 'homePage.cleanButton.text' })}
                    </SmallItem>
                </>
            )}
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
