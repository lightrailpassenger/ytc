import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import styled from '@emotion/styled';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router';
import {
    useParams,
    useSearchParams,
    NavLink,
    Navigate,
} from 'react-router-dom';

import { usePlaylistItems } from '../contexts/Playlist.jsx';
import { useVideo, useVideoInfo, useVideoUrl } from '../contexts/VideoInfo.jsx';

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

function WatchPage({ volume, setVolume }) {
    const { createdAt: rawCreatedAt, playlistId, current } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [createdAt, setCreatedAt] = useState(rawCreatedAt);
    const [getPlaylistItems] = usePlaylistItems();
    const getVideoFromUrl = useVideoUrl();

    const video = useVideo(createdAt);
    const [downloadedList, setDownloadedList] = useVideoInfo();
    const playlistItemCountRef = useRef(null);

    useEffect(() => {
        if (
            downloadedList?.length &&
            !rawCreatedAt &&
            playlistId &&
            typeof current === 'string'
        ) {
            (async () => {
                const items = await getPlaylistItems(playlistId);
                const { createdAt: thisCreatedAt = null } =
                    getVideoFromUrl(items[current]) ?? {};

                playlistItemCountRef.current = items.length;
                setCreatedAt(thisCreatedAt);
            })();
        }
    }, [
        downloadedList,
        createdAt,
        playlistId,
        current,
        getPlaylistItems,
        getVideoFromUrl,
    ]);

    const shouldRefetch = Boolean(!video || searchParams.get('refetch'));
    const [hasFetched, setHasFetched] = useState(!shouldRefetch);

    const videoElementRef = useRef();

    useLayoutEffect(() => {
        if (videoElementRef.current) {
            const videoElement = videoElementRef.current;

            videoElement.volume = volume;
            videoElement.play();
        }
    }, [volume, video, hasFetched]);

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

    if (typeof playlistItemCountRef.current === 'number') {
        const currentNum = Number(current);

        if (
            currentNum < 0 ||
            currentNum >= playlistItemCountRef.current ||
            !Number.isInteger(currentNum)
        ) {
            return <Navigate to="/404" />;
        }
    }

    if (downloadedList) {
        if (!video) {
            if (createdAt && hasFetched) {
                return <Navigate to="/404" />;
            } else {
                // Loading time too short, no loading state is added.
                return null;
            }
        }
    } else {
        return null;
    }

    const { name } = video;

    return (
        <div>
            <Helmet>
                <title>{name}</title>
            </Helmet>
            <Top>
                <NavLink to={rawCreatedAt ? '/' : '/playlist'}>{'<'}</NavLink>
                <h1>{name}</h1>
            </Top>
            <Center>
                <Video
                    autoplay
                    controls
                    ref={videoElementRef}
                    onVolumeChange={(event) => {
                        setVolume(event.target.volume);
                    }}
                    onEnded={() => {
                        const next = Number(current) + 1;

                        if (
                            typeof playlistItemCountRef.current === 'number' &&
                            next < playlistItemCountRef.current
                        ) {
                            navigate(
                                `/play/${encodeURIComponent(playlistId)}/${next}`
                            );
                        }
                    }}
                    src={`http://localhost:9000/videos/${encodeURIComponent(createdAt)}`}
                />
            </Center>
        </div>
    );
}

export default WatchPage;
