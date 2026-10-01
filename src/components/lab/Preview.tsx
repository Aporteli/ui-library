'use client';

type PreviewMode =
  | 'desktop'
  | 'tablet'
  | 'mobile';

type PreviewBackground =
  | 'dark'
  | 'light'
  | 'grid'
  | 'checker';

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
  background: PreviewBackground;
  state: PreviewState;
};

type BackgroundStyle = {
  backgroundColor: string;
  color: string;
  backgroundImage?: string;
  backgroundSize?: string;
  backgroundPosition?: string;
};

function escapeScriptContent(
  value: string,
) {
  return value.replace(
    /<\/script/gi,
    '<\\/script',
  );
}

const MODE_WIDTHS: Record<
  PreviewMode,
  string
> = {
  desktop: '100%',
  tablet: '768px',
  mobile: '390px',
};

const BACKGROUND_STYLES: Record<
  PreviewBackground,
  BackgroundStyle
> = {
  dark: {
    backgroundColor: '#171717',
    color: 'white',
  },

  light: {
    backgroundColor: '#f5f5f5',
    color: '#171717',
  },

  grid: {
    backgroundColor: '#171717',
    backgroundImage:
      'linear-gradient(rgba(255,255,255,.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.06) 1px, transparent 1px)',
    backgroundSize: '24px 24px',
    color: 'white',
  },

  checker: {
    backgroundColor: '#171717',
    backgroundImage:
      'linear-gradient(45deg, rgba(255,255,255,.045) 25%, transparent 25%), linear-gradient(-45deg, rgba(255,255,255,.045) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, rgba(255,255,255,.045) 75%), linear-gradient(-45deg, transparent 75%, rgba(255,255,255,.045) 75%)',
    backgroundSize: '24px 24px',
    backgroundPosition:
      '0 0, 0 12px, 12px -12px, -12px 0',
    color: 'white',
  },
};

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
  background,
  state,
}: PreviewProps) {
  const safeCode =
    escapeScriptContent(code);

  const backgroundStyle =
    BACKGROUND_STYLES[background];

  const previewDocument = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />

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

      background-color: ${backgroundStyle.backgroundColor};
      color: ${backgroundStyle.color};

      ${
        backgroundStyle.backgroundImage
          ? `background-image: ${backgroundStyle.backgroundImage};`
          : ''
      }

      ${
        backgroundStyle.backgroundSize
          ? `background-size: ${backgroundStyle.backgroundSize};`
          : ''
      }

      ${
        backgroundStyle.backgroundPosition
          ? `background-position: ${backgroundStyle.backgroundPosition};`
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

    ${STATE_CSS}
  </style>
</head>

<body>
  <div
    id="root"
    data-preview-state="${state}"
  ></div>

  <script type="text/babel" data-presets="react">
    try {
      const Component = () => (
        ${safeCode}
      );

      const root = ReactDOM.createRoot(
        document.getElementById("root")
      );

      root.render(
        React.createElement(Component)
      );
    } catch (error) {
      const root = document.getElementById("root");

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
        "ui-monospace, monospace";
      errorBox.style.fontSize = "13px";
      errorBox.style.lineHeight = "1.6";
      errorBox.style.whiteSpace = "pre-wrap";

      errorBox.textContent =
        error instanceof Error
          ? error.message
          : String(error);

      root.appendChild(errorBox);
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