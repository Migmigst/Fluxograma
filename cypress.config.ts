import { defineConfig } from 'cypress';
import { addMatchImageSnapshotPlugin } from 'cypress-image-snapshot/plugin';
import coverage from '@cypress/code-coverage/task';
import eyesPlugin from '@applitools/eyes-cypress';
import { registerArgosTask } from '@argos-ci/cypress/task';

export default eyesPlugin(
  defineConfig({
    projectId: 'n2sma2',
    viewportWidth: 1440,
    viewportHeight: 1024,
    e2e: {
      specPattern: 'cypress/integration/**/*.{js,ts}',
      setupNodeEvents(on, config) {
        coverage(on, config);
        on('before:browser:launch', (browser, launchOptions) => {
          if (browser.name === 'chrome' && browser.isHeadless) {
            launchOptions.args.push('--window-size=1440,1024', '--force-device-scale-factor=1');
          }
          return launchOptions;
        });
        addMatchImageSnapshotPlugin(on, config);
        // copy any needed variables from process.env to config.env
        config.env.useAppli = process.env.USE_APPLI ? true : false;

        // Argos
        registerArgosTask(on, config, {
          uploadToArgos: !!process.env.CI,
          token: 'fc3a35cf5200db928d65b2047861582d9444032b',
        });

        // do not forget to return the changed config object!
        return config;
      },
    },
    video: false,
  })
);
