import { rest } from 'msw';
import { EPMSType, EIMType } from '../shared/typings';

export const getHandlers = (basePath: string) => [
  rest.get(basePath + '/health-check/liveness', (req, res, ctx) => {
    return res(ctx.status(200));
  }),
  rest.post(basePath + '/login', (req, res, ctx) => {
    // Persist user's authentication in the session
    sessionStorage.setItem('is-authenticated', 'true');
    return res(
      // Respond with a 200 status code
      ctx.status(200),
    );
  }),
  rest.get(basePath + '/user', (req, res, ctx) => {
    // Check if the user is authenticated in this session
    const isAuthenticated = sessionStorage.getItem('is-authenticated');
    if (!isAuthenticated) {
      // If not authenticated, respond with a 403 error
      return res(
        ctx.status(403),
        ctx.json({
          errorMessage: 'Not authorized',
        }),
      );
    }
    // If authenticated, return a mocked user details
    return res(
      ctx.status(200),
      ctx.json({
        username: 'admin',
      }),
    );
  }),
  rest.get(basePath + '/agents/practice_integrations/:practiceId', (req, res, ctx) => {
    const { practiceId } = req.params;
    return res(
      ctx.status(200),
      ctx.json({
        practiceId,
        integrationPms: {
          type: EPMSType.dental4windows,
          version: 'mock.d4w.1.0.0',
        },
        integrationIms: [
          {
            type: EIMType.centaurMediaSuite,
            version: 'mock.cmsImg.1.0.0',
          },
          {
            type: EIMType.romexis,
            version: 'mock.romexis.6.0.0',
            settings: {
              dbHost: 'localhost,54680',
              dbName: 'Romexis_db',
              dbUser: 'cotreat',
              dbPassword: 'cotreat',
            },
          },
        ],
      }),
    );
  }),
  rest.patch(basePath + '/agents/practice_integrations/:practiceId', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
      }),
    );
  }),
  rest.patch(basePath + '/agents/integration_pms/:practiceId', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
      }),
    );
  }),
  rest.patch(basePath + '/agents/integration_im/:practiceId', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
      }),
    );
  }),
  rest.get(
    basePath + '/agents/practice_integrations/:practiceId/d4w_configuration',
    (req, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json({
          encryptedD4WUsername: 'cotreat',
          enctyptedD4WPassword: 'cotreat',
          enctyptedCMSImgUsername: 'cotreat',
          enctyptedCMSImgPassword: 'cotreat',
        }),
      );
    },
  ),
  rest.get(
    basePath + '/agents/practice_integrations/:practiceId/practice_detail',
    (req, res, ctx) => {
      return res(ctx.status(200), ctx.text('Test Practice'));
    },
  ),
  rest.post(
    basePath + '/agents/practice_integrations/:practiceId/start_sync_pms_data',
    (req, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json({
          lastSyncStartedAt: new Date(),
        }),
      );
    },
  ),
  rest.post(
    basePath + '/agents/practice_integrations/:practiceId/finish_up_sync_pms_data',
    (req, res, ctx) => {
      return res(ctx.status(200));
    },
  ),
  rest.get(
    basePath + '/agents/practice_integrations/:practiceId/sync_configuration',
    (req, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json({
          syncDateRangeStartFromNowInBusinessDays: 0,
          syncDateRangeEndFromNowInBusinessDays: -7,
        }),
      );
    },
  ),
];
