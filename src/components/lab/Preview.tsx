
'use client';

import { useMemo } from 'react';

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

const MODE_WIDTHS: Record<PreviewMode, string> = {
  desktop: '100%',
  tablet: '768px',
  mobile: '390px',
};

const STATE_CSS: Record<PreviewState, string> = {
  default: '',

  hover: `
    .preview-state-target:hover {
      transform: translateY(-2px) !important;
      filter: brightness(1.05);
    }
  `,

  active: `
    .preview-state-target {
      transform: scale(0.97) !important;
    }
  `,

  focus: `
    .preview-state-target {
      outline: 2px solid rgba(59, 130, 246, 0.8) !important;
      outline-offset: 3px !important;
    }
  `,

  disabled: `
    .preview-state-target {
      opacity: 0.5 !important;
      pointer-events: none !important;
    }
  `,

  loading: `
    .preview-state-target {
      opacity: 0.75 !important;
      pointer-events: none !important;
      position: relative !important;
    }

    .preview-state-target::after {
      content: "";
      position: absolute;
      width: 14px;
      height: 14px;
      border: 2px solid rgba(255,255,255,.35);
      border-right-color: transparent;
      border-radius: 9999px;
      animation: preview-spin 0.7s linear infinite;
      top: 50%;
      left: 50%;
      margin-left: -7px;
      margin-top: -7px;
    }

    @keyframes preview-spin {
      to {
        transform: rotate(360deg);
      }
    }
  `,
};

function escapeScriptContent(value: string) {
  return value.replace(/<\/script/gi, '<\\/script');
}

function hexToRgb(hex: string) {
  const normalized = hex.replace('#', '');

  if (normalized.length !== 6) {
    return {
      r: 255,
      g: 255,
      b: 255,
    };
  }

  return {
    r: parseInt(normalized.slice(0, 2), 16),
    g: parseInt(normalized.slice(2, 4), 16),
    b: parseInt(normalized.slice(4, 6), 16),
  };
}

function getContrastColor(hex: string) {
  const { r, g, b } = hexToRgb(hex);

  const luminance =
    (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  return luminance > 0.6 ? '#111827' : '#ffffff';
}

function rgbaFromHex(hex: string, alpha: number) {
  const { r, g, b } = hexToRgb(hex);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function getPatternStyles(
  pattern: PreviewPattern,
  color: string,
) {
  if (pattern === 'grid') {
    return `
      background-image:
        linear-gradient(
          ${rgbaFromHex(color, 0.08)} 1px,
          transparent 1px
        ),
        linear-gradient(
          90deg,
          ${rgbaFromHex(color, 0.08)} 1px,
          transparent 1px
        );
      background-size: 24px 24px;
    `;
  }

  if (pattern === 'checker') {
    return `
      background-image:
        linear-gradient(
          45deg,
          ${rgbaFromHex(color, 0.06)} 25%,
          transparent 25%
        ),
        linear-gradient(
          -45deg,
          ${rgbaFromHex(color, 0.06)} 25%,
          transparent 25%
        ),
        linear-gradient(
          45deg,
          transparent 75%,
          ${rgbaFromHex(color, 0.06)} 75%
        ),
        linear-gradient(
          -45deg,
          transparent 75%,
          ${rgbaFromHex(color, 0.06)} 75%
        );

      background-size: 24px 24px;

      background-position:
        0 0,
        0 12px,
        12px -12px,
        -12px 0;
    `;
  }

  return '';
}

export function Preview({
  code,
  mode,
  pattern,
  color,
  state,
}: PreviewProps) {
  const srcDoc = useMemo(() => {
    const safeCode = escapeScriptContent(code);

    const stateCss = STATE_CSS[state];
    const patternStyles = getPatternStyles(pattern, color);
    const contrastColor = getContrastColor(color);

    const runtime = `
<script>
(() => {
  const rootElement =
    document.getElementById('preview-root');

  function showError(error) {
    if (!rootElement) {
      return;
    }

    rootElement.innerHTML = '';

    const errorElement =
      document.createElement('pre');

    errorElement.style.margin = '0';
    errorElement.style.padding = '20px';
    errorElement.style.fontFamily =
      'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';
    errorElement.style.fontSize = '13px';
    errorElement.style.lineHeight = '1.6';
    errorElement.style.whiteSpace = 'pre-wrap';
    errorElement.style.color = '#ef4444';

    errorElement.textContent =
      error && error.message
        ? error.message
        : String(error);

    rootElement.appendChild(errorElement);
  }

  window.addEventListener('error', function (event) {
    if (event.target && event.target !== window) {
      return;
    }

    showError(event.error || new Error(event.message));
  });

  window.addEventListener('unhandledrejection', function (event) {
    showError(
      event.reason instanceof Error
        ? event.reason
        : new Error(String(event.reason))
    );
  });

  try {
    const source = ${JSON.stringify(safeCode)};

    function definePreview(babel) {
      const t = babel.types;

      function unwrap(node) {
        while (
          node &&
          (node.type === 'TSAsExpression' ||
            node.type === 'TSTypeAssertion' ||
            node.type === 'TSSatisfiesExpression' ||
            node.type === 'ParenthesizedExpression')
        ) {
          node = node.expression;
        }

        return node;
      }

      function isComponentFactory(node) {
        if (!t.isCallExpression(node)) {
          return false;
        }

        const callee = node.callee;
        let name = '';

        if (t.isIdentifier(callee)) {
          name = callee.name;
        } else if (
          t.isMemberExpression(callee) &&
          !callee.computed &&
          t.isIdentifier(callee.property)
        ) {
          name = callee.property.name;
        }

        return name === 'forwardRef' || name === 'memo' || name === 'lazy';
      }

      function looksLikeComponent(node) {
        const value = unwrap(node);

        if (!value) {
          return false;
        }

        if (
          t.isArrowFunctionExpression(value) ||
          t.isFunctionExpression(value) ||
          t.isClassExpression(value) ||
          isComponentFactory(value)
        ) {
          return true;
        }

        return (
          t.isIdentifier(value) &&
          (value.name === '__DefaultExport' || /^[A-Z]/.test(value.name))
        );
      }

      function componentNameFrom(statement) {
        if (
          (t.isFunctionDeclaration(statement) ||
            t.isClassDeclaration(statement)) &&
          statement.id
        ) {
          return statement.id.name;
        }

        if (!t.isVariableDeclaration(statement)) {
          return null;
        }

        const declarations = statement.declarations;

        for (let index = declarations.length - 1; index >= 0; index--) {
          const declarator = declarations[index];

          if (!t.isIdentifier(declarator.id) || !declarator.init) {
            continue;
          }

          const init = unwrap(declarator.init);

          if (
            looksLikeComponent(declarator.init) ||
            (t.isCallExpression(init) && /^[A-Z]/.test(declarator.id.name))
          ) {
            return declarator.id.name;
          }
        }

        return null;
      }

      function isDirective(node) {
        return (
          t.isExpressionStatement(node) &&
          t.isStringLiteral(node.expression) &&
          (node.expression.value === 'use client' ||
            node.expression.value === 'use strict' ||
            node.expression.value === 'use server')
        );
      }

      function renderElement(expression) {
        return t.returnStatement(
          t.callExpression(
            t.memberExpression(t.identifier('React'), t.identifier('createElement')),
            [expression]
          )
        );
      }

      return {
        visitor: {
          Program(path) {
            const statements = path.node.body.map(function (node) {
              return t.cloneNode(node, true);
            });

            const next = [];

            statements.forEach(function (node) {
              if (t.isImportDeclaration(node) || t.isExportAllDeclaration(node)) {
                return;
              }

              if (t.isExportNamedDeclaration(node)) {
                if (node.declaration) {
                  next.push(node.declaration);
                }
                return;
              }

              if (t.isExportDefaultDeclaration(node)) {
                const declaration = node.declaration;

                if (
                  t.isFunctionDeclaration(declaration) ||
                  t.isClassDeclaration(declaration)
                ) {
                  if (!declaration.id) {
                    declaration.id = t.identifier('__DefaultExport');
                  }

                  next.push(declaration);
                  return;
                }

                if (
                  t.isArrowFunctionExpression(declaration) ||
                  t.isFunctionExpression(declaration) ||
                  t.isClassExpression(declaration)
                ) {
                  next.push(
                    t.variableDeclaration('const', [
                      t.variableDeclarator(
                        t.identifier('__DefaultExport'),
                        declaration
                      ),
                    ])
                  );
                  return;
                }

                next.push(t.expressionStatement(declaration));
                return;
              }

              next.push(node);
            });

            const meaningful = next.filter(function (node) {
              return !t.isEmptyStatement(node) && !isDirective(node);
            });

            if (meaningful.length === 0) {
              throw new Error('Preview code is empty.');
            }

            const last = meaningful[meaningful.length - 1];
            let body;

            if (t.isExpressionStatement(last)) {
              const before = next.filter(function (node) {
                return node !== last && !isDirective(node);
              });

              body = before.concat([
                looksLikeComponent(last.expression)
                  ? renderElement(last.expression)
                  : t.returnStatement(last.expression),
              ]);
            } else {
              let chosen = null;
              let fallback = null;

              for (let index = meaningful.length - 1; index >= 0; index--) {
                const name = componentNameFrom(meaningful[index]);

                if (!name) {
                  continue;
                }

                if (/^[A-Z]/.test(name) || name === '__DefaultExport') {
                  chosen = name;
                  break;
                }

                if (!fallback) {
                  fallback = name;
                }
              }

              const renderName = chosen || fallback;

              if (!renderName) {
                throw new Error(
                  'Add a React component or a JSX element to preview it.'
                );
              }

              body = next
                .filter(function (node) {
                  return !isDirective(node);
                })
                .concat([renderElement(t.identifier(renderName))]);
            }

            path.node.directives = [];
            path.node.body = [
              t.functionDeclaration(
                t.identifier('__UILabPreview'),
                [],
                t.blockStatement(body)
              ),
            ];
          },
        },
      };
    }

    const transformed = Babel.transform(source, {
      filename: 'preview.tsx',
      sourceType: 'module',
      presets: [
        ['react', { runtime: 'classic' }],
        ['typescript', { isTSX: true, allExtensions: true }],
      ],
      plugins: [definePreview],
    }).code;

    if (!transformed || transformed.indexOf('__UILabPreview') === -1) {
      throw new Error('Babel could not transform the preview code.');
    }

    const factory = new Function(
      'React',
      [
        'var useState = React.useState;',
        'var useEffect = React.useEffect;',
        'var useLayoutEffect = React.useLayoutEffect;',
        'var useRef = React.useRef;',
        'var useMemo = React.useMemo;',
        'var useCallback = React.useCallback;',
        'var useId = React.useId;',
        'var useReducer = React.useReducer;',
        'var useContext = React.useContext;',
        'var useTransition = React.useTransition;',
        'var useDeferredValue = React.useDeferredValue;',
        'var useImperativeHandle = React.useImperativeHandle;',
        'var createContext = React.createContext;',
        'var forwardRef = React.forwardRef;',
        'var memo = React.memo;',
        'var lazy = React.lazy;',
        'var Fragment = React.Fragment;',
        'var Children = React.Children;',
        'function cn() {',
        '  var classes = [];',
        '  function push(value) {',
        '    if (!value) return;',
        "    if (typeof value === 'string' || typeof value === 'number') { classes.push(String(value)); return; }",
        '    if (Array.isArray(value)) { value.forEach(push); return; }',
        '    if (typeof value === "object") {',
        '      Object.keys(value).forEach(function (key) { if (value[key]) classes.push(key); });',
        '    }',
        '  }',
        '  for (var i = 0; i < arguments.length; i++) push(arguments[i]);',
        "  return classes.join(' ');",
        '}',
        transformed,
        'return __UILabPreview;',
      ].join('\\n')
    );

    const PreviewComponent = factory(React);

    if (typeof PreviewComponent !== 'function') {
      throw new Error('Preview renderer could not be created.');
    }

    class PreviewBoundary extends React.Component {
      constructor(props) {
        super(props);
        this.state = { error: null };
      }

      static getDerivedStateFromError(error) {
        return { error: error };
      }

      componentDidCatch(error) {
        showError(error);
      }

      render() {
        if (this.state.error) {
          return null;
        }

        return React.createElement(this.props.component);
      }
    }

    ReactDOM.createRoot(rootElement).render(
      React.createElement(PreviewBoundary, {
        component: PreviewComponent,
      })
    );
  } catch (error) {
    showError(error);
  }
})();
</script>
`;

    return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />

    <meta
      name="viewport"
      content="width=device-width, initial-scale=1.0"
    />

    <script
      src="https://unpkg.com/react@18/umd/react.development.js"
    ></script>

    <script
      src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"
    ></script>

    <script
      src="https://unpkg.com/@babel/standalone/babel.min.js"
    ></script>

    <script>
      tailwind.config = {
        theme: {
          extend: {
            colors: {
              bg: "#0e1b2b",
              paper: "#f5f1e8",
              ink: "#101820",
              fg: "#e7e2d6",
              accent: "#e4572e",
              line: "#2a3b52",
              "line-paper": "#c9c2ae",
              muted: "#7c93a8",
              success: "#4c9a6a",
            },
            fontFamily: {
              body: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
              display: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
              mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
            },
          },
        },
      };
    </script>

    <script
      src="https://cdn.tailwindcss.com"
    ></script>

    <style>
      * {
        box-sizing: border-box;
      }

      html,
      body {
        margin: 0;
        width: 100%;
        min-height: 100%;
      }

      body {
        font-family:
          Inter,
          ui-sans-serif,
          system-ui,
          -apple-system,
          BlinkMacSystemFont,
          "Segoe UI",
          sans-serif;
      }

      #preview-root {
        width: 100%;
        min-height: 100vh;
      }

      ${stateCss}
    </style>
  </head>

  <body>
    <div
      id="preview-root"
      style="
        min-height: 100vh;
        width: 100%;
        ${patternStyles}
        background-color: ${color};
        color: ${contrastColor};
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 32px;
      "
    ></div>

    ${runtime}
  </body>
</html>
`;
  }, [code, color, pattern, state]);

  return (
    <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto bg-background p-4">
      <div
        className="overflow-hidden rounded-box border border-hairline bg-background shadow-sm transition-all"
        style={{
          width: MODE_WIDTHS[mode],
          maxWidth: '100%',
          height: '100%',
          minHeight: '500px',
        }}
      >
        <iframe
          title="Component preview"
          srcDoc={srcDoc}
          sandbox="allow-scripts"
          className="h-full min-h-[500px] w-full border-0"
        />
      </div>
    </div>
  );
}
