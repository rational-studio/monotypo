import { MPackage } from '../../../../utils/MPackage';
import { Tabs, Tab } from 'ink-tab';
import Spinner from 'ink-spinner';

interface DevUIProps {
  taskQueue: MPackage[][];
}

const DevUI: React.FC<DevUIProps> = ({ taskQueue }) => {
  return (
    <Tabs onChange={() => void 0} flexDirection="column">
      {taskQueue
        .flat()
        .reverse()
        .map(item => (
          <Tab name={item.name} key={item.name}>
            <Spinner type="dots" /> {item.name}
          </Tab>
        ))}
    </Tabs>
  );
};

export default DevUI;
