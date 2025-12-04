import { colors } from '../styles/designTokens';

/**
 * Format JSON with syntax highlighting
 *
 * Utility function to format and syntax-highlight JSON data for display.
 * Used across multiple test components to display API responses.
 *
 * @param data - Any data that can be stringified to JSON
 * @returns React element with syntax-highlighted JSON
 */
export const formatJSON = (data: any): React.ReactElement => {
  const jsonString = JSON.stringify(data, null, 2);

  const highlighted = jsonString.split('\n').map((line, lineIndex) => {
    const parts: React.ReactNode[] = [];
    const keyRegex = /"([^"]+)":/g;

    const lineWithMarkedKeys = line.replace(keyRegex, (_matched, key) => {
      return `__KEY__"${key}"__ENDKEY__:`;
    });

    const lineWithMarkedStrings = lineWithMarkedKeys.replace(
      /: "([^"]*)"/g,
      (_matched, value) => {
        return `: __STR__"${value}"__ENDSTR__`;
      }
    );

    const lineWithMarkedNumbers = lineWithMarkedStrings.replace(
      /: (\d+\.?\d*)([,\s]|$)/g,
      (_matched, num, after) => {
        return `: __NUM__${num}__ENDNUM__${after}`;
      }
    );

    const finalLine = lineWithMarkedNumbers.replace(
      /: (true|false|null)([,\s]|$)/g,
      (_matched, bool, after) => {
        return `: __BOOL__${bool}__ENDBOOL__${after}`;
      }
    );

    const segments = finalLine.split(/(__KEY__|__ENDKEY__|__STR__|__ENDSTR__|__NUM__|__ENDNUM__|__BOOL__|__ENDBOOL__)/);
    let inKey = false;
    let inStr = false;
    let inNum = false;
    let inBool = false;

    segments.forEach((segment, i) => {
      if (segment === '__KEY__') {
        inKey = true;
      } else if (segment === '__ENDKEY__') {
        inKey = false;
      } else if (segment === '__STR__') {
        inStr = true;
      } else if (segment === '__ENDSTR__') {
        inStr = false;
      } else if (segment === '__NUM__') {
        inNum = true;
      } else if (segment === '__ENDNUM__') {
        inNum = false;
      } else if (segment === '__BOOL__') {
        inBool = true;
      } else if (segment === '__ENDBOOL__') {
        inBool = false;
      } else if (segment) {
        if (inKey) {
          parts.push(
            <span key={`${lineIndex}-${i}`} style={{ color: colors.syntaxKey, fontWeight: 600 }}>
              {segment}
            </span>
          );
        } else if (inStr) {
          parts.push(
            <span key={`${lineIndex}-${i}`} style={{ color: colors.syntaxString }}>
              {segment}
            </span>
          );
        } else if (inNum) {
          parts.push(
            <span key={`${lineIndex}-${i}`} style={{ color: colors.syntaxNumber }}>
              {segment}
            </span>
          );
        } else if (inBool) {
          parts.push(
            <span key={`${lineIndex}-${i}`} style={{ color: colors.syntaxBoolean }}>
              {segment}
            </span>
          );
        } else {
          parts.push(<span key={`${lineIndex}-${i}`}>{segment}</span>);
        }
      }
    });

    return <div key={lineIndex}>{parts}</div>;
  });

  return <>{highlighted}</>;
};
