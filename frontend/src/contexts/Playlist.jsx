import {
    createContext,
    useContext,
    useMemo,
    useState,
    useCallback,
} from 'react';
import { produce } from 'immer';

const PlaylistContext = createContext(null);
const PlaylistItemContext = createContext(null);

function Provider(props) {
    const { children } = props;
    const [playlists, setPlaylists] = useState(null);
    const [playlistItemMap, setPlaylistItemMap] = useState(new Map());
    const context = useMemo(
        () => ({
            playlists,
            setPlaylists,
        }),
        [playlists, setPlaylists]
    );
    const itemContext = useMemo(
        () => ({
            playlistItemMap,
            setPlaylistItemMap,
        }),
        [playlistItemMap, setPlaylistItemMap]
    );

    return (
        <PlaylistContext.Provider value={context}>
            <PlaylistItemContext.Provider value={itemContext}>
                {children}
            </PlaylistItemContext.Provider>
        </PlaylistContext.Provider>
    );
}

const usePlaylist = (signal) => {
    const { playlists, setPlaylists } = useContext(PlaylistContext);

    const refetchPlaylists = useCallback(async () => {
        const res = await fetch('http://localhost:9000/playlists', { signal });
        const { playlists: fetchedPlaylists } = await res.json();

        setPlaylists(fetchedPlaylists);
    }, [setPlaylists]);

    return [playlists, refetchPlaylists];
};

const usePlaylistItems = () => {
    const { playlistItemMap, setPlaylistItemMap } =
        useContext(PlaylistItemContext);
    const getItems = useCallback(async (id) => {
        if (playlistItemMap.has(id)) {
            return playlistItemMap.get(id);
        } else {
            const res = await fetch(
                `http://localhost:9000/playlists/${encodeURIComponent(id)}`
            );

            if (res.ok) {
                const { urls } = await res.json();

                setPlaylistItemMap((prevMap) => {
                    return produce(prevMap, (map) => map.set(id, urls));
                });

                return urls;
            } else {
                setPkaylistItemMap((prevMap) => {
                    return produce(prevMap, (map) => map.set(id, null));
                });

                return null;
            }
        }
    }, []);

    return getItems;
};

export default Provider;
export { usePlaylist, usePlaylistItems };
