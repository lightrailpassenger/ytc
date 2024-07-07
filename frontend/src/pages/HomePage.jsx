import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';

function HomePage() {
    const [downloadedList, setDownloadedList] = useState([]);

    useEffect(() => {
        const ac = new AbortController();
        (async () => {
            await fetch('http://localhost:9000/init', {
                method: 'POST',
                signal: ac.signal,
            });

            const res = await fetch('http://localhost:9000/downloaded-videos');
            const { videos } = await res.json();

            setDownloadedList(videos);
        })();

        return () => {
            ac.abort();
        };
    }, []);

    return (
        <div>
            <h1>Videos</h1>
            {downloadedList.map(({ url, createdAt, name }) => (
                <NavLink key={url} to={`/watch/${encodeURIComponent(createdAt)}`}>
                    {name}
                </NavLink>
            ))}
        </div>
    );
}

export default HomePage;
