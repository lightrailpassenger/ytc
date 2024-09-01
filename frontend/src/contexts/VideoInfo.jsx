import { createContext, useContext, useMemo, useState, useCallback } from 'react';

const VideoInfoContext = createContext([]);

function Provider(props) {
    const { children } = props;
    const [value, setValue] = useState([]);
    const context = useMemo(() => ({
        value,
        setValue,
    }), [value, setValue]);

    return (
        <VideoInfoContext.Provider value={context}>
            {children}
        </VideoInfoContext.Provider>
    );
}

const useVideo = (createdAt) => {
    const { value } = useContext(VideoInfoContext);
    const info = useMemo(() => {
        return value.find((item) => (item.createdAt === createdAt));
    }, [value, createdAt]);

    return info;
};

const useVideoInfo = () => {
    const { value, setValue } = useContext(VideoInfoContext);
    const update = useCallback((info) => {
        setValue(info);
    }, [setValue]);

    return [value, update];
};

export default Provider;
export { VideoInfoContext, useVideo, useVideoInfo };
