import * as React from 'react';
import { Container, Grid, Header } from 'semantic-ui-react';
import StoryList from './StoryList';
import StoryView from './StoryView';
import { listStories, selectStory } from './actions/stories';
import { useAppSelector } from './hooks/useAppSelector';
import { useAppDispatch } from './hooks/useAppDispatch';

const Stories = () => {
  const {selected, stories} = useAppSelector(state => state.stories)
  const dispatch = useAppDispatch()

  React.useEffect(() => {
    dispatch(listStories())
  }, [dispatch])

  return (
    <Container style={{padding: '1em'}} fluid={true}>
      <Header as="h1" dividing={true}>Hacker News with gRPC-Web</Header>

      <Grid columns={2} stackable={true} divided={'vertically'}>
        <Grid.Column width={4}>
          <StoryList
            selected={selected}
            stories={stories}
            onStorySelect={id => dispatch(selectStory(id))}
          />
        </Grid.Column>

        <Grid.Column width={12} stretched={true}>
          { selected
            ? <StoryView story={selected} />
            : null
          }
        </Grid.Column>
      </Grid>

    </Container>
  );
}

export default Stories;
