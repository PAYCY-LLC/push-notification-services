import jwt from 'jsonwebtoken';

class IdentityService {
    constructor(logger, appConfig) {
        this.logger = logger;
        this.appConfig = appConfig
        this.users = appConfig.users;
    }

    static async verifyJWT(token) {
        try {
            const { options } = this.appConfig.jwt;
            return jwt.verify(token, this.appConfig.jwt.secret, options);
        } catch (err) {
            throw new Error(err);
        }
    }

    async authenticate(username, password) {
        const result = {};
        const user = this.getUserByUsername(username);

        if (user && user.password === password) {
            const payload = { role: user.role };
            const { options } = this.appConfig.jwt;
            const token = jwt.sign(payload, this.appConfig.jwt.secret, options);

            result.token = token;
            result.status = 200;
        } else {
            result.status = 401;
            result.error = 'Authentication error';
        }

        return result;
    }

    getUserByUsername(username) {
        return this.users.find(user => user.username === username);
    }

    async getUsers() {
        return this.users.map(u => IdentityService.omitPassword(u));
    }

    static omitPassword(user) {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
}

export default IdentityService;
