import '@fontsource/atkinson-hyperlegible/400.css';
import '@fontsource/atkinson-hyperlegible/700.css';
import '@fontsource-variable/bricolage-grotesque/index.css';
import '@fontsource/noto-serif/400.css';
import '@fontsource/noto-serif/600.css';
import './styles/tokens.css';
import './styles/base.css';
import './styles/components.css';
import './styles/layout.css';
import './styles/views.css';
import './styles/art.css';
import './styles/home.css';

import { startApp } from './app';
import { installGlobalErrorHandlers, renderFatalError } from './errors';
import { registerServiceWorker } from './pwa';

installGlobalErrorHandlers();
try {
  startApp();
  registerServiceWorker();
} catch (error) {
  renderFatalError(error);
}
