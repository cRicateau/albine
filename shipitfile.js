module.exports = function (shipit) {
  require('shipit-deploy')(shipit);

  shipit.initConfig({
    default: {
      workspace: '/tmp/albine',
      deployTo: '~/albine',
      repositoryUrl: 'git@github.com:cRicateau/albine.git',
      ignores: ['.git', 'tests', '.gitignore', 'devops', 'client/tests', 'node_modules', 'client/node_modules'],
      rsync: ['--del'],
      keepReleases: 3,
      key: '~/.ssh/id_rsa',
      shallowClone: true,
    },
    staging: {
      branch: 'master',
      servers: 'www-data@13.58.99.30',
    },
    prod: {
      branch: 'master',
      servers: 'www-data@',
    },
  });

  const yarn = '/usr/local/lib/npm/bin/yarn';

  const npmBackInstall = function () {
    return shipit.remote(`cd ${shipit.releasePath} && ${yarn} install`);
  };

  const npmFrontInstall = function () {
    return shipit.remote(`cd ${shipit.releasePath}/client && ${yarn} install`);
  };

  const npmFrontClean= function () {
    return shipit.remote(`cd ${shipit.releasePath}/client && npm run clean`);
  }

  const npmFrontCompile = function () {
    return shipit.remote(`cd ${shipit.releasePath} && npm run build:client`);
  }

  const runMigrations = function () {
    return shipit.remote(`cd ${shipit.releasePath} && npm run migrate:up`);
  }

  const restartServer = function () {
    return shipit.remote(`cd ${shipit.releasePath} && npm run start:prod`);
  }

  shipit.on('deployed', function() {
    return shipit.start('install');
  });

  // blTask will block other tasks during its execution (synchronous)
  shipit.blTask('install', function() {
    return npmBackInstall()
      .then(npmFrontInstall)
      .then(npmFrontClean)
      .then(npmFrontCompile)
      .then(runMigrations)
      .then(restartServer)
      .then(() => {
        shipit.log('Deployment successfull!\n');
      })
      .catch(function (err) {
        shipit.log(`Deployment failed: ${err}`);
      });
  });
};
