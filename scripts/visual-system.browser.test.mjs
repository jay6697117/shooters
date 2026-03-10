import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

function parseArgs(argv) {
  const args = {
    url: 'http://127.0.0.1:4173/index.html',
    outDir: path.join(rootDir, 'output', 'visual-regression'),
    headless: true
  };

  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    const next = argv[i + 1];
    if (arg === '--url' && next) {
      args.url = next;
      i += 1;
    } else if (arg === '--out-dir' && next) {
      args.outDir = path.resolve(process.cwd(), next);
      i += 1;
    } else if (arg === '--headless' && next) {
      args.headless = next !== '0' && next !== 'false';
      i += 1;
    }
  }

  return args;
}

async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
}

function expect(condition, message, failures) {
  if (!condition) failures.push(message);
}

function summarizeVisualState(snapshot) {
  return snapshot?.visualState || snapshot || {};
}

function scenarioResult(name, snapshot, failures) {
  return {
    name,
    ok: failures.length === 0,
    failures,
    visualState: summarizeVisualState(snapshot)
  };
}

async function main() {
  const args = parseArgs(process.argv);
  await ensureDir(args.outDir);

  let chromium;
  try {
    ({ chromium } = await import('playwright'));
  } catch (error) {
    console.error(`Playwright is required for visual-system.browser.test.mjs: ${error.message}`);
    process.exit(1);
  }

  const browser = await chromium.launch({
    headless: args.headless,
    args: ['--use-gl=angle', '--use-angle=swiftshader']
  });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  const runtimeErrors = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      runtimeErrors.push({ type: 'console.error', text: msg.text() });
    }
  });
  page.on('pageerror', (error) => {
    runtimeErrors.push({ type: 'pageerror', text: String(error) });
  });

  await page.goto(args.url, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => Boolean(window.phase21TestApi), { timeout: 10000 });
  await page.waitForTimeout(300);

  const runScenario = async (name, browserAction, verify, screenshotName = null) => {
    const snapshot = await page.evaluate(browserAction);
    if (screenshotName) {
      await page.screenshot({
        path: path.join(args.outDir, screenshotName),
        fullPage: false,
        type: 'png'
      });
    }
    const failures = [];
    try {
      verify(snapshot, failures);
    } catch (error) {
      failures.push(error instanceof Error ? error.message : String(error));
    }
    return scenarioResult(name, snapshot, failures);
  };

  const results = [];

  results.push(await runScenario(
    'duel-calm',
    () => {
      const api = window.phase21TestApi;
      return api.startMatch('duel', { forcePlaying: true });
    },
    (snapshot, failures) => {
      const visual = summarizeVisualState(snapshot);
      expect(visual.density === 'focus', 'duel-calm should keep focus density', failures);
      expect(visual.severity === 'calm', 'duel-calm severity should be calm', failures);
      expect(visual.foregroundSeverity === null, 'duel-calm foregroundSeverity should be null', failures);
      expect(visual.backgroundSeverity === null, 'duel-calm backgroundSeverity should be null', failures);
      expect(visual.persistentDanger === false, 'duel-calm persistentDanger should be false', failures);
      expect(Object.values(visual.layerSeverities || {}).every((value) => value === null), 'duel-calm layerSeverities should be empty', failures);
    }
  ));

  results.push(await runScenario(
    'damage-pressure',
    () => {
      const api = window.phase21TestApi;
      api.startMatch('duel', { forcePlaying: true });
      return api.damagePlayer(15, 'p2');
    },
    (snapshot, failures) => {
      const visual = summarizeVisualState(snapshot);
      expect(visual.foregroundSeverity === 'pressure', 'damage-pressure foregroundSeverity should be pressure', failures);
      expect(visual.backgroundSeverity === null, 'damage-pressure backgroundSeverity should be null', failures);
      expect(visual.layerSeverities?.feed === 'pressure', 'damage-pressure feed layer should be pressure', failures);
      expect(visual.layerSeverities?.pulse === 'pressure', 'damage-pressure pulse layer should be pressure', failures);
      expect(visual.layerSeverities?.camera === 'pressure', 'damage-pressure camera layer should be pressure', failures);
      expect(visual.layerSeverities?.vignette === null, 'damage-pressure vignette layer should be null', failures);
    }
  ));

  results.push(await runScenario(
    'near-miss-warning',
    () => {
      const api = window.phase21TestApi;
      api.startMatch('duel', { forcePlaying: true });
      return api.firePlayerNearMiss('p2');
    },
    (snapshot, failures) => {
      const visual = summarizeVisualState(snapshot);
      expect(visual.foregroundSeverity === 'warning', 'near-miss-warning foregroundSeverity should be warning', failures);
      expect(visual.backgroundSeverity === null, 'near-miss-warning backgroundSeverity should be null', failures);
      expect(visual.layerSeverities?.feed === 'warning', 'near-miss-warning feed layer should be warning', failures);
      expect(visual.layerSeverities?.pulse === 'warning', 'near-miss-warning pulse layer should be warning', failures);
      expect(visual.layerSeverities?.vignette === null, 'near-miss-warning vignette layer should be null', failures);
    }
  ));

  results.push(await runScenario(
    'low-hp-critical',
    () => {
      const api = window.phase21TestApi;
      api.startMatch('duel', { forcePlaying: true });
      api.setEntityHp('p1', 20);
      return api.advance(180);
    },
    (snapshot, failures) => {
      const visual = summarizeVisualState(snapshot);
      expect(visual.foregroundSeverity === null, 'low-hp-critical foregroundSeverity should be null', failures);
      expect(visual.backgroundSeverity === 'critical', 'low-hp-critical backgroundSeverity should be critical', failures);
      expect(visual.persistentDanger === true, 'low-hp-critical persistentDanger should be true', failures);
      expect(visual.layerSeverities?.badge === 'critical', 'low-hp-critical badge layer should be critical', failures);
      expect(visual.layerSeverities?.vignette === 'critical', 'low-hp-critical vignette layer should be critical', failures);
    },
    'critical.png'
  ));

  results.push(await runScenario(
    'heal-reset',
    () => {
      const api = window.phase21TestApi;
      api.startMatch('duel', { forcePlaying: true });
      api.setEntityHp('p1', 20);
      api.advance(180);
      api.setEntityHp('p1', 90);
      return api.advance(120);
    },
    (snapshot, failures) => {
      const visual = summarizeVisualState(snapshot);
      expect(visual.foregroundSeverity === null, 'heal-reset foregroundSeverity should be null', failures);
      expect(visual.backgroundSeverity === null, 'heal-reset backgroundSeverity should be null', failures);
      expect(visual.persistentDanger === false, 'heal-reset persistentDanger should be false', failures);
      expect(visual.layerSeverities?.vignette === null, 'heal-reset vignette should be cleared', failures);
      expect(visual.layerSeverities?.badge === null, 'heal-reset badge layer should be cleared', failures);
    }
  ));

  results.push(await runScenario(
    'critical-plus-swing-overlap',
    () => {
      const api = window.phase21TestApi;
      api.startMatch('duel', { forcePlaying: true });
      api.setEntityHp('p1', 20);
      api.advance(180);
      api.setEntityHp('p2', 10);
      return api.firePlayerAtTeam('p2', { resetFeedback: false });
    },
    (snapshot, failures) => {
      const visual = summarizeVisualState(snapshot);
      expect(visual.severity === 'swing', 'critical-plus-swing-overlap severity should resolve to swing', failures);
      expect(visual.foregroundSeverity === 'swing', 'critical-plus-swing-overlap foregroundSeverity should be swing', failures);
      expect(visual.backgroundSeverity === 'critical', 'critical-plus-swing-overlap backgroundSeverity should stay critical', failures);
      expect(visual.bannerVisible === false, 'critical-plus-swing-overlap should suppress the center banner', failures);
      expect(visual.layerSeverities?.feed === 'swing', 'critical-plus-swing-overlap feed layer should be swing', failures);
      expect(visual.layerSeverities?.pulse === 'swing', 'critical-plus-swing-overlap pulse layer should be swing', failures);
      expect(visual.layerSeverities?.camera === 'swing', 'critical-plus-swing-overlap camera layer should be swing', failures);
      expect(visual.layerSeverities?.badge === 'critical', 'critical-plus-swing-overlap badge layer should remain critical', failures);
      expect(visual.layerSeverities?.vignette === 'critical', 'critical-plus-swing-overlap vignette layer should remain critical', failures);
      expect(visual.combatFeed?.emphasis === 'hero', 'critical-plus-swing-overlap combatFeed should use hero emphasis', failures);
    },
    'critical-plus-swing.png'
  ));

  results.push(await runScenario(
    'deathmatch-compact-calm',
    () => {
      const api = window.phase21TestApi;
      return api.startMatch('deathmatch', { forcePlaying: true });
    },
    (snapshot, failures) => {
      const visual = summarizeVisualState(snapshot);
      expect(visual.density === 'compact', 'deathmatch-compact-calm density should be compact', failures);
      expect(visual.severity === 'calm', 'deathmatch-compact-calm severity should be calm', failures);
      expect(visual.foregroundSeverity === null, 'deathmatch-compact-calm foregroundSeverity should be null', failures);
      expect(visual.backgroundSeverity === null, 'deathmatch-compact-calm backgroundSeverity should be null', failures);
    }
  ));

  results.push(await runScenario(
    'restart-menu-reset',
    () => {
      const api = window.phase21TestApi;
      api.startMatch('duel', { forcePlaying: true });
      api.setEntityHp('p1', 20);
      api.advance(180);
      api.setEntityHp('p2', 10);
      api.firePlayerAtTeam('p2', { resetFeedback: false });
      return api.startMatch('duel', { forcePlaying: true });
    },
    (snapshot, failures) => {
      const visual = summarizeVisualState(snapshot);
      expect(visual.severity === 'calm', 'restart-menu-reset severity should be calm', failures);
      expect(visual.foregroundSeverity === null, 'restart-menu-reset foregroundSeverity should be null', failures);
      expect(visual.backgroundSeverity === null, 'restart-menu-reset backgroundSeverity should be null', failures);
      expect(visual.persistentDanger === false, 'restart-menu-reset persistentDanger should be false', failures);
      expect(Object.values(visual.layerSeverities || {}).every((value) => value === null), 'restart-menu-reset layerSeverities should be cleared', failures);
    }
  ));

  const report = {
    url: args.url,
    generatedAt: new Date().toISOString(),
    results,
    runtimeErrors
  };

  await fs.writeFile(
    path.join(args.outDir, 'results.json'),
    JSON.stringify(report, null, 2),
    'utf8'
  );

  const failingScenarios = results.filter((entry) => !entry.ok);
  if (runtimeErrors.length > 0) {
    await fs.writeFile(
      path.join(args.outDir, 'runtime-errors.json'),
      JSON.stringify(runtimeErrors, null, 2),
      'utf8'
    );
  }

  await browser.close();

  assert.equal(runtimeErrors.length, 0, `browser runtime errors: ${JSON.stringify(runtimeErrors, null, 2)}`);
  assert.equal(failingScenarios.length, 0, `visual regression failures: ${JSON.stringify(failingScenarios, null, 2)}`);
  console.log(`visual-system.browser.test.mjs passed with ${results.length} scenarios`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
