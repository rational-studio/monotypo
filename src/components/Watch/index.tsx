import { Text, Box } from 'ink';
import { FC, useState } from 'react';
import * as Gradient from 'ink-gradient';
import { Tabs, Tab } from 'ink-tab';
interface WatchProps {}

const Watch: FC<WatchProps> = () => {
  const [activeTabName, setActiveTabName] = useState('');

  // the handleTabChange method get two arguments:
  // - the tab name
  // - the React tab element
  function handleTabChange(name: string) {
    // set the active tab name to do what you want with the content
    setActiveTabName(name);
  }

  return (
    <Box flexDirection="column">
      <Tabs onChange={handleTabChange}>
        <Tab name="foo">Foo</Tab>
        <Tab name="bar">Bar</Tab>
        <Tab name="baz">Baz</Tab>
      </Tabs>
      <Box>
        {activeTabName === 'foo' && (
          <Gradient name="atlas">
            <Text>Selected tab is "foo"</Text>
          </Gradient>
        )}
        {activeTabName === 'bar' && (
          <Gradient name="summer">
            <Text>Selected tab is "bar"</Text>
          </Gradient>
        )}
        {activeTabName === 'baz' && (
          <Gradient name="instagram">
            <Text>Selected tab is "baz"</Text>
          </Gradient>
        )}
      </Box>
    </Box>
  );
};

export default Watch;
