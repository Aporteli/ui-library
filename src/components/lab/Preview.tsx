
'use client';

type PreviewMode = 'desktop' | 'tablet' | 'mobile';

type PreviewPattern = 'none' | 'grid' | 'checker';

type PreviewState =
  | 'default'
  | 'hover'
  | 'active'
  | 'focus'
  | 'disabled'
  | 'loading';

type PreviewProps = {
  code: string;
  mode: PreviewMode;
  pattern: PreviewPattern;
  color: string;
  state: PreviewState;
};

function escapeScriptContent(value: string) {
  return value.replace(/<\/script/gi, '<\\/script');
}

const MODE_WIDTHS: Record<PreviewMode, string> = {
  desktop: '100%',
  tablet: '768px',
  mobile: '390px',
};

function hexToRgb(hex: string): {
  r: number;
  g: number;
  b: number;
} {
  const cleaned = hex.replace('#', '').trim();

  const full =
    cleaned.length === 3
      ? cleaned
          .split('')
          .map((c) => c + c)
          .join('')
      : cleaned;

  return {
    r: parseInt(full.substring(0, 2), 16) || 0,
    g: parseInt(full.substring(2, 4), 16) || 0,
    b: parseInt(full.substring(4, 6), 16) || 0,
  };
}

function getContrastColor(hex: string): string {
  const { r, g, b } = hexToRgb(hex);

  const luminance =
    (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  return luminance > 0.55 ? '#171717' : '#ffffff';
}

function rgbaFromHex(hex: string, alpha: number): string {
  const { r, g, b } = hexToRgb(hex);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function getPatternStyles(
  pattern: PreviewPattern,
  color: string,
): {
  image?: string;
  size?: string;
  position?: string;
} {
  if (pattern === 'none') {
    return {};
  }

  const overlay = getContrastColor(color);

  if (pattern === 'grid') {
    return {
      image: `
        linear-gradient(
          ${rgbaFromHex(overlay, 0.07)} 1px,
          transparent 1px
        ),
        linear-gradient(
          90deg,
          ${rgbaFromHex(overlay, 0.07)} 1px,
          transparent 1px
        )
      `,
      size: '24px 24px',
      position: '0 0',
    };
  }

  return {
    image: `
      linear-gradient(
        45deg,
        ${rgbaFromHex(overlay, 0.05)} 25%,
        transparent 25%
      ),
      linear-gradient(
        -45deg,
        ${rgbaFromHex(overlay, 0.05)} 25%,
        transparent 25%
      ),
      linear-gradient(
        45deg,
        transparent 75%,
        ${rgbaFromHex(overlay, 0.05)} 75%
      ),
      linear-gradient(
        -45deg,
        transparent 75%,
        ${rgbaFromHex(overlay, 0.05)} 75%
      )
    `,
    size: '24px 24px',
    position:
      '0 0, 0 12px, 12px -12px, -12px 0',
  };
}

const STATE_CSS = `
  [data-preview-state="hover"] button,
  [data-preview-state="hover"] [role="button"],
  [data-preview-state="hover"] a {
    transform: translateY(-2px);
    filter: brightness(1.08);
  }

  [data-preview-state="active"] button,
  [data-preview-state="active"] [role="button"],
  [data-preview-state="active"] a {
    transform: translateY(1px) scale(.98);
    filter: brightness(.92);
  }

  [data-preview-state="focus"] button,
  [data-preview-state="focus"] [role="button"],
  [data-preview-state="focus"] a,
  [data-preview-state="focus"] input,
  [data-preview-state="focus"] textarea,
  [data-preview-state="focus"] select {
    outline: 2px solid rgba(255,255,255,.8);
    outline-offset: 3px;
  }

  [data-preview-state="disabled"] button,
  [data-preview-state="disabled"] [role="button"],
  [data-preview-state="disabled"] input,
  [data-preview-state="disabled"] textarea,
  [data-preview-state="disabled"] select {
    opacity: .45;
    cursor: not-allowed;
    filter: grayscale(.25);
  }

  [data-preview-state="loading"] button,
  [data-preview-state="loading"] [role="button"] {
    position: relative;
    color: transparent !important;
    pointer-events: none;
  }

  [data-preview-state="loading"] button::after,
  [data-preview-state="loading"] [role="button"]::after {
    content: "";
    position: absolute;
    left: 50%;
    top: 50%;
    width: 16px;
    height: 16px;
    margin-left: -8px;
    margin-top: -8px;
    border-radius: 9999px;
    border: 2px solid currentColor;
    border-right-color: transparent;
    animation: preview-spin .7s linear infinite;
  }

  @keyframes preview-spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

export function Preview({
  code,
  mode,
  pattern,
  color,
  state,
}: PreviewProps) {
  const textColor = getContrastColor(color);

  const patternStyles = getPatternStyles(
    pattern,
    color,
  );

  const safeCode = escapeScriptContent(code);

  const previewDocument = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  />

  <script src="https://unpkg.com/react@18/umd/react.development.js"></script>

  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>

  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>

  <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>

  <style>
    html,
    body {
      margin: 0;
      width: 100%;
      min-height: 100%;
    }

    body {
      min-height: 100vh;
      padding: 32px;
      box-sizing: border-box;

      display: flex;
      align-items: center;
      justify-content: center;

      background-color: ${color};
      color: ${textColor};

      ${
        patternStyles.image
          ? `background-image: ${patternStyles.image};`
          : ''
      }

      ${
        patternStyles.size
          ? `background-size: ${patternStyles.size};`
          : ''
      }

      ${
        patternStyles.position
          ? `background-position: ${patternStyles.position};`
          : ''
      }

      font-family:
        Inter,
        ui-sans-serif,
        system-ui,
        -apple-system,
        BlinkMacSystemFont,
        "Segoe UI",
        sans-serif;
    }

    *,
    *::before,
    *::after {
      box-sizing: border-box;
    }

    button,
    input,
    textarea,
    select {
      font: inherit;
    }

    ${STATE_CSS}
  </style>
</head>

<body>
  <div
    id="root"
    data-preview-state="${state}"
  ></div>

  <script>
    window.__previewError = null;

    window.addEventListener(
      "error",
      function (event) {
        window.__previewError =
          event.error || new Error(event.message);
      }
    );

    window.addEventListener(
      "unhandledrejection",
      function (event) {
        window.__previewError =
          event.reason instanceof Error
            ? event.reason
            : new Error(String(event.reason));
      }
    );
  </script>

  <script type="text/babel">
    /*
     * =====================================================
     * USER CODE
     * =====================================================
     *
     * The editor can now contain complete React code.
     *
     * Example:
     *
     * function Slider() {
     *   const [value, setValue] = React.useState(50);
     *
     *   return (
     *     <input
     *       type="range"
     *       value={value}
     *       onChange={(event) =>
     *         setValue(Number(event.target.value))
     *       }
     *     />
     *   );
     * }
     *
     * <Slider />
     */

    const userCode = ${JSON.stringify(safeCode)};

    /*
     * -----------------------------------------------------
     * Find the last top-level JSX expression.
     * -----------------------------------------------------
     *
     * We support:
     *
     * function Button() { ... }
     *
     * <Button />
     *
     * The last JSX expression becomes the render target.
     *
     * Instead of trying to manually parse JavaScript,
     * we let Babel parse it for us.
     */

    function previewPlugin({ types: t }) {
      return {
        visitor: {
          Program(path) {
            const body = path.node.body;

            if (body.length === 0) {
              throw new Error(
                "Preview code is empty."
              );
            }

            const lastStatement =
              body[body.length - 1];

            if (
              !t.isExpressionStatement(
                lastStatement
              )
            ) {
              throw new Error(
                "The preview code must end with a JSX element, for example <Button />."
              );
            }

            const expression =
              lastStatement.expression;

            body[body.length - 1] =
              t.returnStatement(expression);
          }
        }
      };
    }

    try {
      /*
       * We create a React component around
       * the user's complete program.
       *
       * This means hooks are valid.
       */
      const wrappedSource = \`
function __PreviewComponent() {
  \${userCode}
}
\`;

      /*
       * Transform JSX + modern JavaScript.
       */
      const transformed =
        Babel.transform(
          wrappedSource,
          {
            presets: [
              [
                "react",
                {
                  runtime: "classic"
                }
              ],
              [
                "env",
                {
                  modules: false
                }
              ]
            ],
            plugins: [
              previewPlugin
            ]
          }
        ).code;

      /*
       * Execute the transformed program.
       *
       * React is passed explicitly.
       */
      const createComponent =
        new Function(
          "React",
          transformed +
          "\\nreturn __PreviewComponent;"
        );

      const PreviewComponent =
        createComponent(React);

      /*
       * Mount React.
       */
      const rootElement =
        document.getElementById("root");

      const root =
        ReactDOM.createRoot(rootElement);

      root.render(
        React.createElement(
          PreviewComponent
        )
      );

    } catch (error) {
      const root =
        document.getElementById("root");

      root.innerHTML = "";

      const errorBox =
        document.createElement("div");

      errorBox.style.width = "100%";
      errorBox.style.maxWidth = "720px";
      errorBox.style.padding = "20px";

      errorBox.style.border =
        "1px solid rgba(248,113,113,.25)";

      errorBox.style.borderRadius = "12px";

      errorBox.style.background =
        "rgba(127,29,29,.18)";

      errorBox.style.color = "#fca5a5";

      errorBox.style.fontFamily =
        "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace";

      errorBox.style.fontSize = "13px";

      errorBox.style.lineHeight = "1.6";

      errorBox.style.whiteSpace = "pre-wrap";

      errorBox.textContent =
        error instanceof Error
          ? error.message
          : String(error);

      root.appendChild(errorBox);

      console.error(
        "UI Lab preview error:",
        error
      );
    }
  </script>
</body>
</html>
`;

  return (
    <div className="flex h-full w-full items-center justify-center overflow-auto bg-[#0d0d0c] p-6">
      <div
        className="h-full max-w-full overflow-hidden rounded-xl border border-white/10 shadow-2xl transition-[width] duration-200"
        style={{
          width: MODE_WIDTHS[mode],
        }}
      >
        <iframe
          title="Component preview"
          srcDoc={previewDocument}
          sandbox="allow-scripts"
          className="block h-full w-full border-0"
        />
      </div>
    </div>
  );
}

