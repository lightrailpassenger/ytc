import {
    useCallback,
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from 'react';

import { Helmet } from 'react-helmet';
import { useIntl } from 'react-intl';
import { useParams } from 'react-router';
import { NavLink } from 'react-router-dom';

import styled from '@emotion/styled';
import { Reorder } from 'framer-motion';

import VideoSelectionDialog from '../components/VideoSelectionDialog.jsx';

import { usePlaylist, usePlaylistItems } from '../contexts/Playlist.jsx';
import { useVideoInfo } from '../contexts/VideoInfo.jsx';

import usePrevious from '../hooks/usePrevious.js';

const Top = styled.div`
    margin: 33.5px 0;
    font-size: 50px;
    white-space: nowrap;

    > h1 {
        font-size: 50px;
        margin-left: 10px;
        display: inline;
    }
`;

const Item = styled.div`
    font-size: 20px;
    border-radius: 10px;
    margin: 5px;
    padding: 10px;
    width: 80%;
    background-color: white;
    cursor: pointer;
    display: flex;
`;

const SmallItem = styled(Item)`
    width: auto;
    cursor: pointer;
    display: inline-block;
`;

function SinglePlaylistPage() {
    const { playlistId } = useParams();
    const intl = useIntl();
    const [playlists, refetchPlaylists] = usePlaylist();

    useEffect(() => {
        const ac = new AbortController();
        const { signal } = ac;

        (async () => {
            await refetchPlaylists(signal);
        })();

        return () => {
            ac.abort();
        };
    }, []);

    const playlistName = useMemo(() => {
        return playlists?.find(({ id }) => id === playlistId)?.name ?? null;
    }, [playlists, playlistId]);
    const [getPlaylistItems, setPlaylistItems] = usePlaylistItems();

    const [items, setItems] = useState(null);
    const previousItems = usePrevious(items);

    useEffect(() => {
        setItems(null);

        (async () => {
            setItems(await getPlaylistItems(playlistId));
        })();
    }, [playlistId]);

    useEffect(() => {
        const ac = new AbortController();
        const { signal } = ac;

        if (previousItems !== null) {
            (async () => {
                await setPlaylistItems(playlistId, items, signal);
            })();
        }

        return () => {
            ac.abort();
        };
    }, [playlistId, items]);

    const [videoInfo] = useVideoInfo();

    const [isDialogOpen, setDialogOpen] = useState(false);
    const dialogRef = useRef();

    useLayoutEffect(() => {
        if (isDialogOpen) {
            dialogRef.current?.showModal();
        }
    }, [isDialogOpen]);

    const urlSet = useMemo(() => {
        return new Set(items ?? []);
    }, [items]);
    const handleSelectionChange = useCallback(
        (newUrlSet) => {
            setDialogOpen(false);

            if (newUrlSet !== urlSet) {
                setItems([...newUrlSet]);
            }
        },
        [urlSet]
    );
    const videoUrlToNameMap = useMemo(() => {
        return new Map(videoInfo?.map(({ name, url }) => [url, name]) ?? []);
    }, [videoInfo]);

    if (!videoInfo) {
        return null;
    } else if (playlists && !playlistName) {
        return <NavLink to="/404" />;
    } else if (!playlistName || !items) {
        return null;
    }

    return (
        <div>
            <Helmet>
                <title>
                    {intl.formatMessage(
                        { id: 'singlePlaylistPage.title' },
                        { playlistName }
                    )}
                </title>
            </Helmet>
            <VideoSelectionDialog
                ref={dialogRef}
                urlSet={urlSet}
                onChoose={handleSelectionChange}
            />
            <Top>
                <NavLink to="/playlist">{'<'}</NavLink>
                <h1>{playlistName}</h1>
            </Top>
            <div>
                <div>
                    <SmallItem>
                        {intl.formatMessage({
                            id: 'singlePlaylistPage.rename',
                        })}
                    </SmallItem>
                    <SmallItem onClick={() => setDialogOpen(true)}>
                        {intl.formatMessage({
                            id: 'singlePlaylistPage.choose',
                        })}
                    </SmallItem>
                    <SmallItem>
                        <NavLink
                            to={`/play/${encodeURIComponent(playlistId)}/0`}
                        >
                            {'➡️'}
                        </NavLink>
                    </SmallItem>
                </div>
                <Reorder.Group axis="y" values={items} onReorder={setItems}>
                    {items.map((url) => {
                        const name = videoUrlToNameMap.get(url);

                        return (
                            <Reorder.Item key={url} value={url}>
                                <Item>{name}</Item>
                            </Reorder.Item>
                        );
                    })}
                </Reorder.Group>
            </div>
        </div>
    );
}

export default SinglePlaylistPage;
