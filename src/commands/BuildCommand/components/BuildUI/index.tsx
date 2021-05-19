import { MPackage } from '../../../../utils/MPackage';
import { Text, Box } from 'ink';
import Spinner from 'ink-spinner';
import { generateGradient } from '../../../../utils/gradient';
import * as Gradient from 'ink-gradient';
import { useEffect, useState, memo } from 'react';
import { useDuration } from '../../../../utils/useDuration';
import TimeMeasurement from '../../../../components/TimeMeasurement';

interface BuildUIProps {
  taskQueue: MPackage[][];
  isCleanBuild: boolean;
}

const enum BuildState {
  Pending,
  Building,
  Cached,
  BuildingDone,
  BuildingError,
}

const BuildUI: React.FC<BuildUIProps> = ({ taskQueue, isCleanBuild }) => {
  const queue = taskQueue.flat().reverse();
  const maxLength = Math.max(...queue.map(item => item.name.length));
  const [buildingStatus, setBuildingStatus] = useState<{
    [key: string]: BuildState;
  }>(() => {
    const names = queue.map(item => item.name);
    return names.reduce(
      (prev, current) => ({ ...prev, [current]: BuildState.Pending }),
      {}
    );
  });

  const [duration, timeIt] = useDuration();

  useEffect(() => {
    async function execute() {
      const timeFinish = timeIt();
      for (const tasks of taskQueue) {
        await Promise.all(
          tasks.map(async task => {
            if (isCleanBuild) {
              await task.clean();
            }

            if (!isCleanBuild && task.isDepHashUnchanged) {
              setBuildingStatus(s => ({
                ...s,
                [task.name]: BuildState.Cached,
              }));
            } else {
              setBuildingStatus(s => ({
                ...s,
                [task.name]: BuildState.Building,
              }));
              await task.build();
              await task.updateDepHash();
              setBuildingStatus(s => ({
                ...s,
                [task.name]: BuildState.BuildingDone,
              }));
            }
          })
        );
      }
      timeFinish();
    }
    execute();
  }, [taskQueue]);

  return (
    <Box flexDirection="column">
      {queue.map(task => {
        const status = buildingStatus[task.name];
        return (
          <Box key={task.name}>
            <Gradient colors={generateGradient(task.name)}>
              <Text>{task.name.padStart(maxLength)} </Text>
            </Gradient>
            <Text color="white">
              {status === BuildState.Building ? (
                <>
                  <Spinner /> Building...
                </>
              ) : status === BuildState.BuildingDone ? (
                '✅'
              ) : status === BuildState.BuildingError ? (
                '🚫'
              ) : status === BuildState.Cached ? (
                '🚀'
              ) : (
                ''
              )}
            </Text>
          </Box>
        );
      })}
      {typeof duration !== 'undefined' ? (
        <TimeMeasurement durationMs={duration} />
      ) : null}
    </Box>
  );
};

export default memo(BuildUI);
