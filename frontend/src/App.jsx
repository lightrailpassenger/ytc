import { useEffect } from 'react';

import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Global, css } from '@emotion/react';

import VideoInfoContextProvider, { useVideoInfo } from './contexts/VideoInfo.jsx';

import HomePage from './pages/HomePage.jsx';
import WatchPage from './pages/WatchPage.jsx';

const router = createBrowserRouter([
    {
        path: '/',
        element: <HomePage />,
    },
    {
        path: '/watch/:createdAt',
        element: <WatchPage />,
    },
]);

function App() {
    const [, setDownloadedList] = useVideoInfo();

    useEffect(() => {
        const ac = new AbortController();
        const { signal } = ac;
        (async () => {
            await fetch('http://localhost:9000/init', {
                method: 'POST',
                signal,
            });

            const res = await fetch('http://localhost:9000/downloaded-videos', { signal });
            const { videos } = await res.json();

            setDownloadedList(videos);
        })();

        return () => {
            ac.abort();
        };
    }, []);
    return (
        <>
            <Global styles={css`
                body {
                    margin: 1em;
                    padding: 0;
                    background-color: #faffae;
                    color: #a0937d;
                    font-family: 'Fira Sans';
                }

                a, a:visited, a:hover, a:focus, a:active {
                    text-decoration: none !important;
                    color: inherit;
                }
            `} />
            <RouterProvider router={router} />
        </>
    );
}

export default function() {
    return (
        <VideoInfoContextProvider>
            <App />
        </VideoInfoContextProvider>
    );
}
