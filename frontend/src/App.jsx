import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Global, css } from '@emotion/react';

import HomePage from './pages/HomePage.jsx';

const router = createBrowserRouter([
    {
        path: '/',
        element: <HomePage />,
    }
]);

function App() {
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

export default App;
