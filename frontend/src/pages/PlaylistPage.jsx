import { useEffect } from 'react';

import { Helmet } from 'react-helmet';
import { useIntl } from 'react-intl';
import { NavLink } from 'react-router-dom';

import styled from '@emotion/styled';

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

const Item = styled.div`
    font-size: 20px;
    border-radius: 10px;
    margin: 5px;
    padding: 10px;
    width: 80%;
    max-width: 640px;
    background-color: white;
    display: flex;
`;

const ItemText = styled.span`
    flex: 1 1 0;
    min-width: 0;
`;

const ItemButton = styled(NavLink)`
    flex: 0 0 auto;
    cursor: pointer;
    margin-left: 10px;
`;

// eslint-disable-next-line no-unused-vars -- TODO Create button
const SmallItem = styled(Item)`
    width: auto;
    cursor: pointer;
    display: inline-block;
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
            {playlists &&
                (playlists.length === 0 ? (
                    <p>
                        {intl.formatMessage({ id: 'playlistPage.noPlaylist' })}
                    </p>
                ) : (
                    playlists.map((playlist) => (
                        <Item key={playlist.id}>
                            <ItemText>{playlist.name}</ItemText>
                            <ItemButton>{'🖊️'}</ItemButton>
                            <ItemButton
                                to={`/play/${encodeURIComponent(playlist.id)}/0`}
                            >
                                {'➡️'}
                            </ItemButton>
                        </Item>
                    ))
                ))}
        </div>
    );
}

export default PlaylistPage;
