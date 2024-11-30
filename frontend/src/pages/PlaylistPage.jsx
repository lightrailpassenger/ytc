import { useCallback, useEffect, useRef, useState } from 'react';

import { Helmet } from 'react-helmet';
import { useIntl } from 'react-intl';
import { NavLink } from 'react-router-dom';

import styled from '@emotion/styled';

import YesNoTextDialog from '../components/YesNoTextDialog.jsx';

import { usePlaylist } from '../contexts/Playlist.jsx';

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

const Item = styled(NavLink)`
    display: block;
    font-size: 20px;
    border-radius: 10px;
    margin: 5px;
    padding: 10px;
    width: 80%;
    max-width: 640px;
    background-color: white;
    cursor: pointer;
`;

const SmallItem = styled(Item)`
    width: auto;
    cursor: pointer;
    display: inline-block;
`;

const Empty = styled.p`
    margin-left: 5px;
`;

function PlaylistPage() {
    const intl = useIntl();
    const [playlists, refetchPlaylists] = usePlaylist();

    useEffect(() => {
        const ac = new AbortController();
        const { signal } = ac;

        refetchPlaylists(signal);

        return () => {
            ac.abort();
        };
    }, []);

    const createDialogRef = useRef();
    const [newPlaylistName, setNewPlaylistName] = useState('');
    const handleCreateButtonClick = useCallback(() => {
        setNewPlaylistName('');
        createDialogRef.current?.showModal();
    }, []);
    const handleCreatePlaylist = useCallback(
        async (event, name) => {
            const { returnValue } = event.target;

            if (returnValue !== 'cancel') {
                const res = await fetch('http://localhost:9000/playlists', {
                    method: 'post',
                    body: JSON.stringify({ name }),
                });

                if (res.ok) {
                    refetchPlaylists();
                }
            }
        },
        [refetchPlaylists, newPlaylistName]
    );

    return (
        <div>
            <Helmet>
                <title>
                    {intl.formatMessage({ id: 'playlistPage.head.title' })}
                </title>
            </Helmet>
            <Top>
                <NavLink to="/">{'<'}</NavLink>
                <h1>{intl.formatMessage({ id: 'playlistPage.title' })}</h1>
            </Top>
            <YesNoTextDialog
                ref={createDialogRef}
                onClose={handleCreatePlaylist}
                title={intl.formatMessage({
                    id: 'playlistPage.createDialog.title',
                })}
                placeholder={intl.formatMessage({
                    id: 'playlistPage.createDialog.placeholder',
                })}
                cancelText={intl.formatMessage({
                    id: 'playlistPage.createDialog.cancel',
                })}
                submitText={intl.formatMessage({
                    id: 'playlistPage.createDialog.submit',
                })}
            />
            <div>
                <SmallItem onClick={handleCreateButtonClick}>
                    {intl.formatMessage({
                        id: 'playlistPage.createButton.text',
                    })}
                </SmallItem>
            </div>
            {playlists?.length > 0 ? (
                playlists.map((playlist) => (
                    <Item
                        key={playlist.id}
                        to={`/playlist/${encodeURIComponent(playlist.id)}/edit`}
                    >
                        {playlist.name}
                    </Item>
                ))
            ) : (
                <Empty>
                    {intl.formatMessage({ id: 'playlistPage.noPlaylist' })}
                </Empty>
            )}
        </div>
    );
}

export default PlaylistPage;
