import * as React from 'react';
import { Story } from './proto/hackernews_pb';

type StoryViewProps = {
  story: Story.AsObject,
};

const StoryView: React.FC<StoryViewProps> = (props) => {
  const url = `http://localhost:8900/article-proxy?q=${encodeURIComponent(props.story.url)}`;
  return (
    <iframe
      frameBorder="0"
      title={props.story.title}
      style={{
        height: '100vh',
        width: '100%',
      }}
      src={url}
    />
  );
};

export default StoryView;
