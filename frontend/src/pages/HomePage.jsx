import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import styled from '@emotion/styled';

const H1 = styled.h1`
    font-size: 50px;
`;

const Item = styled.div`
    font-size: 20px;
    border-radius: 10px;
    margin: 5px;
    padding: 10px;
    width: 80%;
    max-width: 640px;
    background-color: white;
`;

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
            <H1>Videos</H1>
            {downloadedList.map(({ url, createdAt, name }) => (
                <Item key={url}>
                    <NavLink to={`/watch/${encodeURIComponent(createdAt)}`}>
                        {name}
                    </NavLink>
                </Item>
            ))}
        </div>
    );
}

export default HomePage;
