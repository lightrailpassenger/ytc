import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Helmet } from 'react-helmet';
import { useIntl } from 'react-intl';
import { useNavigate, useParams } from 'react-router';
import { NavLink } from 'react-router-dom';

import styled from '@emotion/styled';
import { Reorder } from 'framer-motion';

import VideoSelectionDialog from '../components/VideoSelectionDialog.jsx';
import YesNoTextDialog from '../components/YesNoTextDialog.jsx';

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
    box-sizing: border-box;
    margin: 5px;
    padding: 10px;
    max-width: calc(80vw - 10px);
    width: 100%;
    background-color: white;
    cursor: pointer;
    display: flex;
`;

const SmallItem = styled(Item)`
    width: auto;
    cursor: pointer;
    display: inline-block;
`;

const Empty = styled.p`
    margin-left: 5px;
`;

const TwoSide = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    max-width: 80vw;
    width: 100%;
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

    const videoSelectionDialogRef = useRef();
    const handleSelectVideos = useCallback(() => {
        videoSelectionDialogRef.current?.showModal();
    }, []);

    const urlSet = useMemo(() => {
        return new Set(items ?? []);
    }, [items]);
    const handleSelectionChange = useCallback(
        (newUrlSet) => {
            if (newUrlSet !== urlSet) {
                setItems([...newUrlSet]);
            }
        },
        [urlSet]
    );
    const videoUrlToNameMap = useMemo(() => {
        return new Map(videoInfo?.map(({ name, url }) => [url, name]) ?? []);
    }, [videoInfo]);

    const renameDialogRef = useRef();
    const handleRenameClick = useCallback(() => {
        renameDialogRef?.current.showModal();
    }, []);
    const handleRename = useCallback(
        async (event, name) => {
            const { returnValue } = event.target;

            if (returnValue !== 'cancel') {
                const res = await fetch(
                    `http://localhost:9000/playlists/${encodeURIComponent(playlistId)}`,
                    {
                        method: 'PATCH',
                        body: JSON.stringify({ name }),
                    }
                );

                if (res.ok) {
                    await refetchPlaylists();
                }
            }
        },
        [playlistId, refetchPlaylists]
    );

    const deleteDialogRef = useRef();
    const navigate = useNavigate();
    const handleDeleteButtonClick = useCallback(() => {
        deleteDialogRef.current?.showModal();
    }, []);
    const handleDeletePlaylist = useCallback(
        async (event) => {
            const { returnValue } = event.target;

            if (returnValue !== 'cancel') {
                const res = await fetch(
                    `http://localhost:9000/playlists/${playlistId}`,
                    { method: 'delete' }
                );

                if (res.ok) {
                    navigate('/playlist');
                }
            }
        },
        [navigate, playlistId]
    );

    if (!videoInfo) {
        return null;
    } else if (playlists && !playlistName) {
        return <NavLink to="/404" />;
    } else if (!playlistName || !items) {
        return null;
    }

    const isEmpty = items?.length > 0;

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
                ref={videoSelectionDialogRef}
                urlSet={urlSet}
                onChoose={handleSelectionChange}
            />
            <YesNoTextDialog
                ref={renameDialogRef}
                onClose={handleRename}
                title={intl.formatMessage({ id: 'renamePlaylistDialog.title' })}
                placeholder={intl.formatMessage({
                    id: 'renamePlaylistDialog.placeholder',
                })}
                cancelText={intl.formatMessage({
                    id: 'renamePlaylistDialog.cancelText',
                })}
                submitText={intl.formatMessage({
                    id: 'renamePlaylistDialog.submitText',
                })}
            />
            <YesNoTextDialog
                ref={deleteDialogRef}
                onClose={handleDeletePlaylist}
                title={intl.formatMessage({ id: 'deletePlaylistDialog.title' })}
                placeholder={intl.formatMessage({
                    id: 'deletePlaylistDialog.placeholder',
                })}
                cancelText={intl.formatMessage({
                    id: 'deletePlaylistDialog.cancelText',
                })}
                submitText={intl.formatMessage({
                    id: 'deletePlaylistDialog.submitText',
                })}
                checkCanSubmit={(text) => text === playlistName}
            />
            <Top>
                <NavLink to="/playlist">{'<'}</NavLink>
                <h1>{playlistName}</h1>
            </Top>
            <div>
                <TwoSide>
                    <div>
                        <SmallItem onClick={handleRenameClick}>
                            {intl.formatMessage({
                                id: 'singlePlaylistPage.rename',
                            })}
                        </SmallItem>
                        <SmallItem onClick={handleSelectVideos}>
                            {intl.formatMessage({
                                id: 'singlePlaylistPage.choose',
                            })}
                        </SmallItem>
                    </div>
                    {isEmpty ? (
                        <SmallItem>
                            <NavLink
                                to={`/play/${encodeURIComponent(playlistId)}/0`}
                            >
                                {'➡️'}
                            </NavLink>
                        </SmallItem>
                    ) : (
                        <SmallItem onClick={handleDeleteButtonClick}>
                            {'🗑️'}
                        </SmallItem>
                    )}
                </TwoSide>
                {isEmpty ? (
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
                ) : (
                    <Empty>
                        {intl.formatMessage({
                            id: 'singlePlaylistPage.noItem',
                        })}
                    </Empty>
                )}
            </div>
        </div>
    );
}

export default SinglePlaylistPage;
