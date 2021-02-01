import { Text } from 'ink';

interface TimeMeasurementProps {
  durationMs: number;
}

const TimeMeasurement: React.FC<TimeMeasurementProps> = ({ durationMs }) => {
  return <Text>✨ Done in {(durationMs / 1000).toFixed(2)}s.</Text>;
};

export default TimeMeasurement;
