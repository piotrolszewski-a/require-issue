const util = require('util');
const exec = util.promisify(require('child_process').exec);

module.exports = {
    /**
     * @returns {Promise<*|String[]>}
     */
    getCommitMessage: async () => {
        const branch = process.env['GITHUB_HEAD_REF'] || process.env['GITHUB_REF'].split('/').pop();
        const targetBranch = process.env['GITHUB_BASE_REF'];
        const { stdout, error } = await exec(`git rev-list --format=%B ${branch} ^${targetBranch}`)
        if (error) {
            throw new Error(`git command error: ${error}`)
        }
        return stdout.trim().split('\n\n');
    }
}