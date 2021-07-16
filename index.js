const core = require('@actions/core');
const fetch = require('node-fetch');
const { getCommitMessage } = require('./git-commands');

const host = core.getInput('host');
const token = core.getInput('token');
const type = core.getInput('type');
const shouldVerifyTitle = core.getInput('verify_title');

process.on('unhandledRejection', up => {
    core.setFailed(`Action failed ${up}`);
});

(async () => {
    const commitMessages = await getCommitMessage();
    core.info(`found ${commitMessages.length} commits`);

    const issues = [...new Set(commitMessages.map(message => {
        return getIssueKeys(message);
    }).flat())];

    issues.forEach(issueKey => verifyIssue(issueKey));
    verifyIssue(getPullRequestTitle());
})();

function getPullRequestTitle() {
    const { context } = github.context;
    core.info(`Current context: ${eventName}`);

    if (context !== 'pull_request') {
      core.setFailed(`Action should be used on pull_request only`);
      return;
    }

    const pullRequestTitle = github.context.payload.pull_request.title;

    core.info(`Fetched Pull Request title: "${pullRequestTitle}"`);

    return pullRequestTitle
}

function getIssueKeys(text) {
    const issues = text.match(/[A-Z]*-\d+/gm);
    if (!issues) {
        core.setFailed('no issue string found');
        process.exit(1);
    }

    return issues
}

function verifyIssue(issueKey) {
  switch (type) {
      case 'jira': {
          fetch(`https://${host}/browse/${issueKey}`, {
              method: 'HEAD',
              headers: { 'Authorization': `Bearer ${token}` }
          })
              .then(response => {
                  if (response.status / 100 !== 2) {
                      core.setFailed(`issue ${issueKey} not found`)
                  }
              })
              .catch((error) => {
                  core.error(error);
              });
          break;
      }
      default: {
          core.setFailed('unknown issue tracker type');
      }
  }
}
