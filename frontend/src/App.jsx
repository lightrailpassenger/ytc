import { useEffect } from 'react';

import { Helmet } from 'react-helmet';
import { IntlProvider } from 'react-intl';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Global, css } from '@emotion/react';

import PlaylistContextProvider from './contexts/Playlist.jsx';
import VideoInfoContextProvider, {
    useVideoInfo,
} from './contexts/VideoInfo.jsx';
import useLocalStorage from './hooks/useLocalStorage.js';

import HomePage from './pages/HomePage.jsx';
import CreatePage from './pages/CreatePage.jsx';
import WatchPage from './pages/WatchPage.jsx';
import PlaylistPage from './pages/PlaylistPage.jsx';
import SinglePlaylistPage from './pages/SinglePlaylistPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

import translations from './translations/index.js';

const createRouter = ({ volume, setVolume, setLocale }) => {
    return createBrowserRouter([
        {
            path: '/',
            element: <HomePage setLocale={setLocale} />,
        },
        {
            path: '/watch/:createdAt',
            element: <WatchPage volume={volume} setVolume={setVolume} />,
        },
        {
            path: '/play/:playlistId/:current',
            element: <WatchPage volume={volume} setVolume={setVolume} />,
        },
        {
            path: '/create',
            element: <CreatePage />,
        },
        {
            path: '/playlist/:playlistId/edit',
            element: <SinglePlaylistPage />,
        },
        {
            path: '/playlist',
            element: <PlaylistPage />,
        },
        {
            path: '*',
            element: <NotFoundPage />,
        },
    ]);
};

function App() {
    const [, setDownloadedList] = useVideoInfo();
    const [locale, setLocale] = useLocalStorage('lang');
    const [volume, setVolume] = useLocalStorage('vol');

    useEffect(() => {
        const ac = new AbortController();
        const { signal } = ac;
        (async () => {
            await fetch('http://localhost:9000/init', {
                method: 'POST',
                signal,
            });

            const res = await fetch('http://localhost:9000/downloaded-videos', {
                signal,
            });
            const { videos } = await res.json();

            setDownloadedList(videos);
        })();

        return () => {
            ac.abort();
        };
    }, []);

    const refinedLocale = locale && locale in translations ? locale : 'en';

    return (
        <IntlProvider
            key={refinedLocale}
            locale={refinedLocale}
            messages={translations[refinedLocale]}
        >
            <Helmet>
                <html lang={refinedLocale} />
            </Helmet>
            <Global
                styles={css`
                    body {
                        margin: 1em;
                        padding: 0;
                        background-color: #faffae;
                        color: #a0937d;
                        font-family: 'Fira Sans';
                    }

                    dialog {
                        border: 1px solid #a0937d;
                        border-radius: 5px;
                    }

                    input,
                    button,
                    h1,
                    h2,
                    span {
                        color: #a0937d;
                        font-family: 'Fira Sans';
                    }

                    input[type='submit'],
                    button {
                        background: white;
                        border-radius: 5px;
                        border: 1px solid #a0937d;
                    }

                    a,
                    a:visited,
                    a:hover,
                    a:focus,
                    a:active {
                        text-decoration: none !important;
                        color: inherit;
                    }

                    ul,
                    ol {
                        list-style-type: none;
                        padding: 0;
                    }
                `}
            />
            <RouterProvider
                router={createRouter({
                    volume,
                    setVolume,
                    setLocale,
                })}
            />
        </IntlProvider>
    );
}

export default function Wrapper() {
    return (
        <VideoInfoContextProvider>
            <PlaylistContextProvider>
                <App />
            </PlaylistContextProvider>
        </VideoInfoContextProvider>
    );
}
