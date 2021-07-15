const core = require('@actions/core');
const fetch = require('node-fetch');
const { getCommitMessage } = require('./git-commands');

const host = core.getInput('host');
const token = core.getInput('token');
const type = core.getInput('type');

process.on('unhandledRejection', up => {
    core.setFailed(`Action failed ${up}`);
});

(async () => {
    const commitMessages = await getCommitMessage();
    core.info(`found ${commitMessages.length} commits`);

    const issues = [...new Set(commitMessages.map(message => {
        const issues = message.match(/[A-Z]*-\d+/gm);
        if (!issues) {
            core.setFailed('no issue string found');
            process.exit(1);
        }
        return issues;
    }).flat())];

    switch (type) {
        case 'jira': {
            fetch(`https://${host}/browse/${issues[0]}`, {
                method: 'HEAD',
                headers: { 'Authorization': `Bearer ${token}` }
            })
                .then(response => {
                    if (response.status / 100 !== 2) {
                        core.setFailed(`issue ${issues[0]} not found`)
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
})();


