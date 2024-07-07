import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import HomePage from './pages/HomePage.jsx';
import './App.css';

const router = createBrowserRouter([
    {
        path: '/',
        element: <HomePage />,
    }
]);

function App() {
    return <RouterProvider router={router} />
}

export default App;
