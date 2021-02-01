import * as Anser from 'anser';
import { escapeCarriageReturn } from 'escape-carriage';
import { Box, Text } from 'ink';

interface AnsiOutputProps {
  text: string;
}

// This is copied from the Jupyter Classic source code
// notebook/static/base/js/utils.js to handle \b in a way
// that is **compatible with Jupyter classic**.   One can
// argue that this behavior is questionable:
//   https://stackoverflow.com/questions/55440152/multiple-b-doesnt-work-as-expected-in-jupyter#
function fixBackspace(txt: string) {
  let tmp = txt;
  do {
    txt = tmp;
    // Cancel out anything-but-newline followed by backspace
    tmp = txt.replace(/[^\n]\x08/gm, '');
  } while (tmp.length < txt.length);
  return txt;
}

const AnsiOutput: React.FC<AnsiOutputProps> = ({ text }) => {
  const outputs = Anser.ansiToJson(escapeCarriageReturn(fixBackspace(text)), {
    json: true,
    remove_empty: true,
  });
  return (
    <Box>
      {outputs.map((item, index) => {
        const decorations = new Set(item.decorations);
        return (
          <Text
            color={item.fg_truecolor || item.fg}
            backgroundColor={item.bg_truecolor || item.bg}
            bold={decorations.has('bold')}
            italic={decorations.has('italic')}
            dimColor={decorations.has('dim')}
            underline={decorations.has('underline')}
            strikethrough={decorations.has('strikethrough')}
            inverse={decorations.has('reverse')}
            key={index}
          >
            {item.content}
          </Text>
        );
      })}
    </Box>
  );
};

export default AnsiOutput;
