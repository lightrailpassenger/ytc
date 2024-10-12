import { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { Helmet } from 'react-helmet';
import {
    useParams,
    useSearchParams,
    NavLink,
    Navigate,
} from 'react-router-dom';

import { useVideo, useVideoInfo } from '../contexts/VideoInfo.jsx';

const Top = styled.span`
    font-size: 50px;
    white-space: nowrap;

    > h1 {
        font-size: 50px;
        margin-left: 10px;
        display: inline;
    }
`;

const Center = styled.div`
    width: 100%;
    text-align: center;
`;

const Video = styled.video`
    width: 100%;
    max-width: 90vw;
    max-height: calc(100vh - 110px);
`;

function WatchPage() {
    const { createdAt } = useParams();
    const [searchParams] = useSearchParams();
    const video = useVideo(createdAt);
    const [, setDownloadedList] = useVideoInfo();

    const shouldRefetch = Boolean(searchParams.get('refetch'));
    const [hasFetched, setHasFetched] = useState(!shouldRefetch);

    useEffect(() => {
        if (shouldRefetch) {
            (async () => {
                const res = await fetch(
                    'http://localhost:9000/downloaded-videos'
                );

                if (res.ok) {
                    const { videos } = await res.json();

                    setDownloadedList(videos);
                    setHasFetched(true);
                }
            })();
        }
    }, [shouldRefetch]);

    if (!video) {
        if (hasFetched) {
            return <Navigate to="/404" />;
        } else {
            // Loading time too short, no loading state is added.
            return null;
        }
    }

    const { name } = video;

    return (
        <div>
            <Helmet>
                <title>{name}</title>
            </Helmet>
            <Top>
                <NavLink to="/">{'<'}</NavLink>
                <h1>{name}</h1>
            </Top>
            <Center>
                <Video
                    autoplay
                    controls
                    src={`http://localhost:9000/videos/${encodeURIComponent(createdAt)}`}
                />
            </Center>
        </div>
    );
}

export default WatchPage;
